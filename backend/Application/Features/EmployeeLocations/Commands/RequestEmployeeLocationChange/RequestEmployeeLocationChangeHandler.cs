using Application.Abstractions;
using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.EmployeeLocations.Commands.RequestEmployeeLocationChange;

public class RequestEmployeeLocationChangeHandler : IRequestHandler<RequestEmployeeLocationChangeCommand, GenericBaseResponse<EmployeeLocationRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public RequestEmployeeLocationChangeHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<EmployeeLocationRequestDto>> Handle(RequestEmployeeLocationChangeCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            return GenericBaseResponse<EmployeeLocationRequestDto>.Unauthorized("User is not authenticated.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
            return GenericBaseResponse<EmployeeLocationRequestDto>.Fail("No active employee profile linked to current user.", HttpStatusCode.Forbidden);

        // One Pending Request Rule
        var existingPending = await _context.EmployeeLocationRequests
            .FirstOrDefaultAsync(r => r.EmployeeId == employee.Id && r.Status == LocationRequestStatus.Pending, cancellationToken);

        if (existingPending != null)
            return GenericBaseResponse<EmployeeLocationRequestDto>.Conflict("You already have a location change request awaiting review.");

        var utcNow = DateTime.UtcNow;

        // Critical Rule: Existing approved personal location remains ACTIVE while change request is pending.
        // Never auto-approve a change request even if it matches a company site.
        var pendingRequest = new EmployeeLocationRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            RequestType = LocationRequestType.Change,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AccuracyMeters = request.AccuracyMeters,
            AddressDescription = request.AddressDescription,
            Status = LocationRequestStatus.Pending,
            Created_Utc = utcNow,
            Created_By = _currentUser.UserName ?? employee.EmployeeCode
        };

        await _context.EmployeeLocationRequests.AddAsync(pendingRequest, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<EmployeeLocationRequestDto>.Success(new EmployeeLocationRequestDto
        {
            Id = pendingRequest.Id,
            EmployeeId = employee.Id,
            EmployeeName = employee.FullNameEn,
            EmployeeNameAr = employee.FullNameAr,
            EmployeeCode = employee.EmployeeCode,
            RequestType = pendingRequest.RequestType,
            Latitude = pendingRequest.Latitude,
            Longitude = pendingRequest.Longitude,
            AccuracyMeters = pendingRequest.AccuracyMeters,
            AddressDescription = pendingRequest.AddressDescription,
            Status = pendingRequest.Status,
            Created_Utc = pendingRequest.Created_Utc
        }, "Location change request submitted. Your current approved location remains active until reviewed.");
    }
}
