using Application.Abstractions;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.EmployeeLocations.Commands.RejectEmployeeLocation;

public class RejectEmployeeLocationHandler : IRequestHandler<RejectEmployeeLocationCommand, GenericBaseResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public RejectEmployeeLocationHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<bool>> Handle(RejectEmployeeLocationCommand request, CancellationToken cancellationToken)
    {
        var locationRequest = await _context.EmployeeLocationRequests
            .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken);

        if (locationRequest == null)
            return GenericBaseResponse<bool>.NotFound("Location request not found.");

        if (locationRequest.Status != LocationRequestStatus.Pending)
            return GenericBaseResponse<bool>.Fail("Only pending location requests can be rejected.", HttpStatusCode.BadRequest);

        var utcNow = DateTime.UtcNow;

        locationRequest.Status = LocationRequestStatus.Rejected;
        locationRequest.RejectionReason = request.RejectionReason.Trim();
        locationRequest.ReviewedAtUtc = utcNow;
        locationRequest.ReviewedBy = _currentUser.UserName ?? "Admin";
        locationRequest.Updated_Utc = utcNow;
        locationRequest.Updated_By = _currentUser.UserName ?? "Admin";

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<bool>.Success(true, "Employee location request rejected successfully.");
    }
}
