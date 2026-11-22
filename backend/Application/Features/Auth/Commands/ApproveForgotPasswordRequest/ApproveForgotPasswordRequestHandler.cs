using Application.Abstractions;
using Application.Email;
using Domain.Common;
using Domain.Enums;
using Domain.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net;

namespace Application.Features.Auth.Commands.ApproveForgotPasswordRequest;

public class ApproveForgotPasswordRequestHandler : IRequestHandler<ApproveForgotPasswordRequestCommand, GenericBaseResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITemporaryPasswordService _tempPasswordService;
    private readonly IEmailService _emailService;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<ApproveForgotPasswordRequestHandler> _logger;

    public ApproveForgotPasswordRequestHandler(
        IApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ITemporaryPasswordService tempPasswordService,
        IEmailService emailService,
        ICurrentUser currentUser,
        ILogger<ApproveForgotPasswordRequestHandler> logger)
    {
        _context = context;
        _userManager = userManager;
        _tempPasswordService = tempPasswordService;
        _emailService = emailService;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<GenericBaseResponse<bool>> Handle(ApproveForgotPasswordRequestCommand request, CancellationToken cancellationToken)
    {
        var recoveryReq = await _context.ForgotPasswordRequests
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken);

        if (recoveryReq == null)
            return GenericBaseResponse<bool>.NotFound("Password recovery request not found.");

        if (recoveryReq.Status != PasswordRecoveryStatus.Pending)
            return GenericBaseResponse<bool>.Fail("Only pending recovery requests can be approved.", HttpStatusCode.BadRequest);

        var user = recoveryReq.User ?? await _userManager.FindByIdAsync(recoveryReq.UserId);
        if (user == null || !user.IsActive)
            return GenericBaseResponse<bool>.Fail("Associated user account is missing or inactive.", HttpStatusCode.BadRequest);

        // Generate strong random temporary password
        var tempPassword = _tempPasswordService.GenerateTemporaryPassword();

        var resetResult = await _tempPasswordService.ResetPasswordWithTemporaryPasswordAsync(_userManager, user, tempPassword);
        if (!resetResult.Succeeded)
        {
            var errors = string.Join("; ", resetResult.Errors.Select(e => e.Description));
            return GenericBaseResponse<bool>.Fail($"Failed to reset credential: {errors}");
        }

        var utcNow = DateTime.UtcNow;
        user.MustChangePasswordOnNextLogin = true;
        user.TemporaryPasswordExpiresAtUtc = utcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        recoveryReq.Status = PasswordRecoveryStatus.Approved;
        recoveryReq.ReviewedAtUtc = utcNow;
        recoveryReq.ReviewedBy = _currentUser.UserName ?? "Admin";
        recoveryReq.Updated_Utc = utcNow;
        recoveryReq.Updated_By = _currentUser.UserName ?? "Admin";

        await _context.SaveChangesAsync(cancellationToken);

        // Send email with temporary password (Section 18 & 22)
        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            var emailMsg = new EmailMessage
            {
                To = user.Email,
                Subject = "Your Temporary Password — NASAQ",
                Body = $"Hello {user.FullName ?? user.UserName},\n\nYour password recovery request has been approved.\nYour new temporary password is: {tempPassword}\n\nPlease log in and update your password.\n\nThank you,\nNASAQ Security Team",
                IsHtml = false
            };

            try
            {
                await _emailService.SendAsync(emailMsg, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to deliver temporary password email to {Email}", user.Email);
            }
        }

        return GenericBaseResponse<bool>.Success(true, "Password recovery request approved. A temporary password was generated and dispatched to the employee's email.");
    }
}
