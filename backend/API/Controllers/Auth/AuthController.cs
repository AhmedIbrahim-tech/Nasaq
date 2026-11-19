using Application.Features.Auth.Commands.ChangePassword;
using Application.Features.Auth.Commands.FirstLoginChangePassword;
using Application.Features.Auth.Commands.Login;
using Application.Features.Auth.Commands.Logout;
using Application.Features.Auth.Commands.RefreshToken;
using Application.Features.Auth.Commands.UpdateProfile;
using Application.Features.Auth.Queries.GetCurrentUser;
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
}
