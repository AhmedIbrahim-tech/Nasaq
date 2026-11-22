using Application.Features.Auth.Commands.AdminDirectChangePassword;
using Application.Features.Auth.Commands.AdminResetPassword;
using Application.Features.Auth.Commands.ApproveForgotPasswordRequest;
using Application.Features.Auth.Commands.ChangePassword;
using Application.Features.Auth.Commands.FirstLoginChangePassword;
using Application.Features.Auth.Commands.Login;
using Application.Features.Auth.Commands.Logout;
using Application.Features.Auth.Commands.RefreshToken;
using Application.Features.Auth.Commands.RejectForgotPasswordRequest;
using Application.Features.Auth.Commands.SubmitForgotPasswordRequest;
using Application.Features.Auth.Commands.UpdateProfile;
using Application.Features.Auth.Queries.GetCurrentUser;
using Application.Features.Auth.Queries.GetPendingForgotPasswordRequests;
using Domain.DTOs.Auth;

namespace API.Controllers;

[ApiController]
public sealed class AuthController : ApiControllerBase
{
    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [AllowAnonymous]
    [HttpPost(Router.Auth.Login)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new LoginCommand(request), cancellationToken));

    [AllowAnonymous]
    [HttpPost(Router.Auth.Refresh)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new RefreshTokenCommand(request), cancellationToken));

    [AllowAnonymous]
    [HttpPost(Router.Auth.Logout)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new LogoutCommand(request), cancellationToken));

    [AllowAnonymous]
    [HttpPost(Router.Auth.FirstLoginChangePassword)]
    public async Task<IActionResult> FirstLoginChangePassword([FromBody] FirstLoginChangePasswordRequest request, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new FirstLoginChangePasswordCommand(request), cancellationToken));

    [Authorize]
    [HttpGet(Router.Auth.Me)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new GetCurrentUserQuery(CurrentUserId), cancellationToken));

    [Authorize]
    [HttpPut(Router.Auth.Profile)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new UpdateProfileCommand(CurrentUserId, request), cancellationToken));

    [Authorize]
    [HttpPost(Router.Auth.ChangePassword)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new ChangePasswordCommand(CurrentUserId, request), cancellationToken));

    [AllowAnonymous]
    [HttpPost(Router.Auth.ForgotPassword)]
    public async Task<IActionResult> ForgotPassword([FromBody] SubmitForgotPasswordRequestCommand command, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    [HttpGet(Router.Auth.PendingPasswordRequests)]
    public async Task<IActionResult> GetPendingPasswordRequests(CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new GetPendingForgotPasswordRequestsQuery(), cancellationToken));

    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    [HttpPost(Router.Auth.ApprovePasswordRequest)]
    public async Task<IActionResult> ApprovePasswordRequest([FromRoute] Guid id, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new ApproveForgotPasswordRequestCommand(id), cancellationToken));

    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    [HttpPost(Router.Auth.RejectPasswordRequest)]
    public async Task<IActionResult> RejectPasswordRequest([FromRoute] Guid id, [FromBody] RejectPasswordRequestBody? body, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new RejectForgotPasswordRequestCommand(id, body?.Reason), cancellationToken));

    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    [HttpPost(Router.Auth.AdminResetPassword)]
    public async Task<IActionResult> AdminResetPassword([FromRoute] string userId, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new AdminResetPasswordCommand(userId), cancellationToken));

    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    [HttpPost(Router.Auth.AdminDirectChangePassword)]
    public async Task<IActionResult> AdminDirectChangePassword([FromRoute] string userId, [FromBody] AdminDirectChangePasswordBody body, CancellationToken cancellationToken) =>
        ActionResult(await _mediator.Send(new AdminDirectChangePasswordCommand(userId, body.NewPassword, body.ConfirmPassword), cancellationToken));
}

public record RejectPasswordRequestBody(string? Reason);
public record AdminDirectChangePasswordBody(string NewPassword, string ConfirmPassword);
