using Application.Abstractions;
using Application.Email;
using Domain.Common;
using Domain.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Application.Features.Auth.Commands.AdminResetPassword;

public class AdminResetPasswordHandler : IRequestHandler<AdminResetPasswordCommand, GenericBaseResponse<bool>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITemporaryPasswordService _tempPasswordService;
    private readonly IEmailService _emailService;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<AdminResetPasswordHandler> _logger;

    public AdminResetPasswordHandler(
        UserManager<ApplicationUser> userManager,
        ITemporaryPasswordService tempPasswordService,
        IEmailService emailService,
        ICurrentUser currentUser,
        ILogger<AdminResetPasswordHandler> logger)
    {
        _userManager = userManager;
        _tempPasswordService = tempPasswordService;
        _emailService = emailService;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<GenericBaseResponse<bool>> Handle(AdminResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null || !user.IsActive)
            return GenericBaseResponse<bool>.NotFound("User account not found or is inactive.");

        var tempPassword = _tempPasswordService.GenerateTemporaryPassword();

        var resetResult = await _tempPasswordService.ResetPasswordWithTemporaryPasswordAsync(_userManager, user, tempPassword);
        if (!resetResult.Succeeded)
        {
            var errors = string.Join("; ", resetResult.Errors.Select(e => e.Description));
            return GenericBaseResponse<bool>.Fail($"Failed to reset credential: {errors}");
        }

        user.MustChangePasswordOnNextLogin = true;
        user.TemporaryPasswordExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            var emailMsg = new EmailMessage
            {
                To = user.Email,
                Subject = "Your Password Was Reset — NASAQ",
                Body = $"Hello {user.FullName ?? user.UserName},\n\nYour account password has been reset by an administrator.\nYour temporary password is: {tempPassword}\n\nPlease log in and update your password.\n\nThank you,\nNASAQ Security Team",
                IsHtml = false
            };

            try
            {
                await _emailService.SendAsync(emailMsg, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to deliver reset email to {Email}", user.Email);
            }
        }

        return GenericBaseResponse<bool>.Success(true, "Temporary password generated, credential updated, and dispatched to the employee's email.");
    }
}
