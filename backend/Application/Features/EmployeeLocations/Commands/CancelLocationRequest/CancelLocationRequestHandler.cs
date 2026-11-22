using Application.Abstractions;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.EmployeeLocations.Commands.CancelLocationRequest;

public class CancelLocationRequestHandler : IRequestHandler<CancelLocationRequestCommand, GenericBaseResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CancelLocationRequestHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<bool>> Handle(CancelLocationRequestCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            return GenericBaseResponse<bool>.Unauthorized("User is not authenticated.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
            return GenericBaseResponse<bool>.Fail("No active employee profile linked to current user.", HttpStatusCode.Forbidden);

        var locationRequest = await _context.EmployeeLocationRequests
            .FirstOrDefaultAsync(r => r.Id == request.RequestId && r.EmployeeId == employee.Id, cancellationToken);

        if (locationRequest == null)
            return GenericBaseResponse<bool>.NotFound("Location request not found.");

        if (locationRequest.Status != LocationRequestStatus.Pending)
            return GenericBaseResponse<bool>.Fail("Only pending location requests can be cancelled.", HttpStatusCode.BadRequest);

        locationRequest.Status = LocationRequestStatus.Cancelled;
        locationRequest.Updated_Utc = DateTime.UtcNow;
        locationRequest.Updated_By = _currentUser.UserName ?? employee.EmployeeCode;

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<bool>.Success(true, "Location request cancelled successfully.");
    }
}
