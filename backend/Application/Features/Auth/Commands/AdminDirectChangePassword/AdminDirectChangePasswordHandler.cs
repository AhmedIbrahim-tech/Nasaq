using Application.Abstractions;
using Application.Email;
using Domain.Common;
using Domain.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System.Net;

namespace Application.Features.Auth.Commands.AdminDirectChangePassword;

public class AdminDirectChangePasswordHandler : IRequestHandler<AdminDirectChangePasswordCommand, GenericBaseResponse<bool>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<AdminDirectChangePasswordHandler> _logger;

    public AdminDirectChangePasswordHandler(
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        ICurrentUser currentUser,
        ILogger<AdminDirectChangePasswordHandler> logger)
    {
        _userManager = userManager;
        _emailService = emailService;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<GenericBaseResponse<bool>> Handle(AdminDirectChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null || !user.IsActive)
            return GenericBaseResponse<bool>.NotFound("User account not found or is inactive.");

        // Check if new password matches existing password
        var isSamePassword = await _userManager.CheckPasswordAsync(user, request.NewPassword);
        if (isSamePassword)
            return GenericBaseResponse<bool>.Fail("New password cannot be the same as the current password.", HttpStatusCode.BadRequest);

        // Securely update password hash
        user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, request.NewPassword);
        user.MustChangePasswordOnNextLogin = false; // Section 20: Temporary = FALSE
        user.TemporaryPasswordExpiresAtUtc = null;
        await _userManager.UpdateSecurityStampAsync(user);

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            return GenericBaseResponse<bool>.Fail($"Failed to set password: {errors}");
        }

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            var emailMsg = new EmailMessage
            {
                To = user.Email,
                Subject = "Your Password Was Updated — NASAQ",
                Body = $"Hello {user.FullName ?? user.UserName},\n\nYour account password has been updated by an administrator.\n\nThank you,\nNASAQ Security Team",
                IsHtml = false
            };

            try
            {
                await _emailService.SendAsync(emailMsg, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to deliver notification email to {Email}", user.Email);
            }
        }

        return GenericBaseResponse<bool>.Success(true, "Employee password updated directly by administrator.");
    }
}
