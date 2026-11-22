using Application.Abstractions;
using Application.Features.Auth.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands.SubmitForgotPasswordRequest;

public class SubmitForgotPasswordRequestHandler : IRequestHandler<SubmitForgotPasswordRequestCommand, GenericBaseResponse<SubmitForgotPasswordResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public SubmitForgotPasswordRequestHandler(
        IApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<GenericBaseResponse<SubmitForgotPasswordResponse>> Handle(SubmitForgotPasswordRequestCommand request, CancellationToken cancellationToken)
    {
        var cleanId = request.Identifier.Trim();

        // Find user by email or username
        var user = await _userManager.FindByEmailAsync(cleanId) ?? await _userManager.FindByNameAsync(cleanId);
        Employee? employee = null;

        if (user == null)
        {
            employee = await _context.Employees
                .AsNoTracking()
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.EmployeeCode == cleanId && e.IsActive, cancellationToken);

            user = employee?.User;
        }
        else
        {
            employee = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == user.Id && e.IsActive, cancellationToken);
        }

        // Generic non-enumerating message (Section 18)
        var genericMessage = "If an account matching the provided information exists, a password recovery request has been submitted for administrator review.";

        if (user == null || !user.IsActive)
        {
            return GenericBaseResponse<SubmitForgotPasswordResponse>.Success(
                new SubmitForgotPasswordResponse { Submitted = true, Message = genericMessage });
        }

        // Check if there is already an active pending request
        var hasPending = await _context.ForgotPasswordRequests
            .AnyAsync(r => r.UserId == user.Id && r.Status == PasswordRecoveryStatus.Pending, cancellationToken);

        if (!hasPending)
        {
            var recoveryReq = new ForgotPasswordRequest
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                EmployeeId = employee?.Id,
                Email = user.Email ?? cleanId,
                EmployeeCode = employee?.EmployeeCode,
                Status = PasswordRecoveryStatus.Pending,
                RequestedAtUtc = DateTime.UtcNow,
                Created_Utc = DateTime.UtcNow,
                Created_By = cleanId
            };

            await _context.ForgotPasswordRequests.AddAsync(recoveryReq, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return GenericBaseResponse<SubmitForgotPasswordResponse>.Success(
            new SubmitForgotPasswordResponse { Submitted = true, Message = genericMessage });
    }
}
