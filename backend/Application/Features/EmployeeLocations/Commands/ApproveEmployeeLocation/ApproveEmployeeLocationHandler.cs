using Application.Abstractions;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.EmployeeLocations.Commands.ApproveEmployeeLocation;

public class ApproveEmployeeLocationHandler : IRequestHandler<ApproveEmployeeLocationCommand, GenericBaseResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ApproveEmployeeLocationHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<bool>> Handle(ApproveEmployeeLocationCommand request, CancellationToken cancellationToken)
    {
        var locationRequest = await _context.EmployeeLocationRequests
            .Include(r => r.Employee)
            .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken);

        if (locationRequest == null)
            return GenericBaseResponse<bool>.NotFound("Location request not found.");

        if (locationRequest.Status != LocationRequestStatus.Pending)
            return GenericBaseResponse<bool>.Fail("Only pending location requests can be approved.", HttpStatusCode.BadRequest);

        var utcNow = DateTime.UtcNow;

        // Deactivate all existing active personal locations for this employee
        var currentActiveLocations = await _context.EmployeePersonalLocations
            .Where(l => l.EmployeeId == locationRequest.EmployeeId && l.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var loc in currentActiveLocations)
        {
            loc.IsActive = false;
            loc.Updated_Utc = utcNow;
            loc.Updated_By = _currentUser.UserName ?? "Admin";
        }

        // Create new approved active location
        var newApproved = new EmployeePersonalLocation
        {
            Id = Guid.NewGuid(),
            EmployeeId = locationRequest.EmployeeId,
            Latitude = locationRequest.Latitude,
            Longitude = locationRequest.Longitude,
            AccuracyMeters = locationRequest.AccuracyMeters,
            AddressDescription = locationRequest.AddressDescription,
            IsApproved = true,
            ApprovedAtUtc = utcNow,
            ApprovedBy = _currentUser.UserName ?? "Admin",
            IsActive = true,
            Source = locationRequest.RequestType == LocationRequestType.InitialRegistration ? "Initial Registration Approved" : "Location Change Approved",
            Created_Utc = utcNow,
            Created_By = _currentUser.UserName ?? "Admin"
        };

        locationRequest.Status = LocationRequestStatus.Approved;
        locationRequest.ReviewedAtUtc = utcNow;
        locationRequest.ReviewedBy = _currentUser.UserName ?? "Admin";
        locationRequest.AdminNotes = request.AdminNotes;
        locationRequest.Updated_Utc = utcNow;
        locationRequest.Updated_By = _currentUser.UserName ?? "Admin";

        await _context.EmployeePersonalLocations.AddAsync(newApproved, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<bool>.Success(true, "Employee location request approved successfully.");
    }
}
