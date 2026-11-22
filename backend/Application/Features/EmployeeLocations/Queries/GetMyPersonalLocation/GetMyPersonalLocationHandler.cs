using Application.Abstractions;
using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.EmployeeLocations.Queries.GetMyPersonalLocation;

public class GetMyPersonalLocationHandler : IRequestHandler<GetMyPersonalLocationQuery, GenericBaseResponse<MyLocationStatusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyPersonalLocationHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<MyLocationStatusDto>> Handle(GetMyPersonalLocationQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            return GenericBaseResponse<MyLocationStatusDto>.Unauthorized("User is not authenticated.");

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
            return GenericBaseResponse<MyLocationStatusDto>.Fail("No active employee profile linked to current user.", HttpStatusCode.Forbidden);

        var approvedLocation = await _context.EmployeePersonalLocations
            .AsNoTracking()
            .Where(l => l.EmployeeId == employee.Id && l.IsActive && l.IsApproved)
            .OrderByDescending(l => l.ApprovedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        var pendingRequest = await _context.EmployeeLocationRequests
            .AsNoTracking()
            .Where(r => r.EmployeeId == employee.Id && r.Status == LocationRequestStatus.Pending)
            .OrderByDescending(r => r.Created_Utc)
            .FirstOrDefaultAsync(cancellationToken);

        var lastRejectedRequest = await _context.EmployeeLocationRequests
            .AsNoTracking()
            .Where(r => r.EmployeeId == employee.Id && r.Status == LocationRequestStatus.Rejected)
            .OrderByDescending(r => r.ReviewedAtUtc ?? r.Created_Utc)
            .FirstOrDefaultAsync(cancellationToken);

        return GenericBaseResponse<MyLocationStatusDto>.Success(new MyLocationStatusDto
        {
            ApprovedLocation = approvedLocation != null ? new EmployeePersonalLocationDto
            {
                Id = approvedLocation.Id,
                EmployeeId = approvedLocation.EmployeeId,
                Latitude = approvedLocation.Latitude,
                Longitude = approvedLocation.Longitude,
                AccuracyMeters = approvedLocation.AccuracyMeters,
                AddressDescription = approvedLocation.AddressDescription,
                IsApproved = approvedLocation.IsApproved,
                ApprovedAtUtc = approvedLocation.ApprovedAtUtc,
                ApprovedBy = approvedLocation.ApprovedBy,
                IsActive = approvedLocation.IsActive,
                Source = approvedLocation.Source,
                Created_Utc = approvedLocation.Created_Utc
            } : null,
            PendingRequest = pendingRequest != null ? new EmployeeLocationRequestDto
            {
                Id = pendingRequest.Id,
                EmployeeId = pendingRequest.EmployeeId,
                RequestType = pendingRequest.RequestType,
                Latitude = pendingRequest.Latitude,
                Longitude = pendingRequest.Longitude,
                AccuracyMeters = pendingRequest.AccuracyMeters,
                AddressDescription = pendingRequest.AddressDescription,
                Status = pendingRequest.Status,
                Created_Utc = pendingRequest.Created_Utc
            } : null,
            LastRejectedRequest = lastRejectedRequest != null ? new EmployeeLocationRequestDto
            {
                Id = lastRejectedRequest.Id,
                EmployeeId = lastRejectedRequest.EmployeeId,
                RequestType = lastRejectedRequest.RequestType,
                Latitude = lastRejectedRequest.Latitude,
                Longitude = lastRejectedRequest.Longitude,
                AccuracyMeters = lastRejectedRequest.AccuracyMeters,
                AddressDescription = lastRejectedRequest.AddressDescription,
                Status = lastRejectedRequest.Status,
                RejectionReason = lastRejectedRequest.RejectionReason,
                ReviewedAtUtc = lastRejectedRequest.ReviewedAtUtc,
                ReviewedBy = lastRejectedRequest.ReviewedBy,
                Created_Utc = lastRejectedRequest.Created_Utc
            } : null
        });
    }
}
