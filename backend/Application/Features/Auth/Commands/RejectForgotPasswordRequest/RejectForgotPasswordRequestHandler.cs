using Application.Abstractions;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Auth.Commands.RejectForgotPasswordRequest;

public class RejectForgotPasswordRequestHandler : IRequestHandler<RejectForgotPasswordRequestCommand, GenericBaseResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public RejectForgotPasswordRequestHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<bool>> Handle(RejectForgotPasswordRequestCommand request, CancellationToken cancellationToken)
    {
        var recoveryReq = await _context.ForgotPasswordRequests
            .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken);

        if (recoveryReq == null)
            return GenericBaseResponse<bool>.NotFound("Password recovery request not found.");

        if (recoveryReq.Status != PasswordRecoveryStatus.Pending)
            return GenericBaseResponse<bool>.Fail("Only pending recovery requests can be rejected.", HttpStatusCode.BadRequest);

        var utcNow = DateTime.UtcNow;
        recoveryReq.Status = PasswordRecoveryStatus.Rejected;
        recoveryReq.RejectionReason = request.RejectionReason?.Trim();
        recoveryReq.ReviewedAtUtc = utcNow;
        recoveryReq.ReviewedBy = _currentUser.UserName ?? "Admin";
        recoveryReq.Updated_Utc = utcNow;
        recoveryReq.Updated_By = _currentUser.UserName ?? "Admin";

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<bool>.Success(true, "Password recovery request rejected successfully.");
    }
}
