using Application.Abstractions;
using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.EmployeeLocations.Commands.AdminChangeEmployeeLocation;

public class AdminChangeEmployeeLocationHandler : IRequestHandler<AdminChangeEmployeeLocationCommand, GenericBaseResponse<EmployeePersonalLocationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public AdminChangeEmployeeLocationHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<EmployeePersonalLocationDto>> Handle(AdminChangeEmployeeLocationCommand request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId, cancellationToken);

        if (employee == null)
            return GenericBaseResponse<EmployeePersonalLocationDto>.NotFound("Employee not found.");

        var utcNow = DateTime.UtcNow;

        // Atomically deactivate old active personal locations
        var activeLocations = await _context.EmployeePersonalLocations
            .Where(l => l.EmployeeId == employee.Id && l.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var l in activeLocations)
        {
            l.IsActive = false;
            l.Updated_Utc = utcNow;
            l.Updated_By = _currentUser.UserName ?? "Admin";
        }

        // Atomically supersede any pending requests
        var pendingRequests = await _context.EmployeeLocationRequests
            .Where(r => r.EmployeeId == employee.Id && r.Status == LocationRequestStatus.Pending)
            .ToListAsync(cancellationToken);

        foreach (var pr in pendingRequests)
        {
            pr.Status = LocationRequestStatus.Superseded;
            pr.ReviewedAtUtc = utcNow;
            pr.ReviewedBy = _currentUser.UserName ?? "Admin";
            pr.AdminNotes = "Superseded by direct admin change";
            pr.Updated_Utc = utcNow;
            pr.Updated_By = _currentUser.UserName ?? "Admin";
        }

        // Create new active approved personal location
        var newLoc = new EmployeePersonalLocation
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AccuracyMeters = request.AccuracyMeters,
            AddressDescription = request.AddressDescription,
            IsApproved = true,
            ApprovedAtUtc = utcNow,
            ApprovedBy = _currentUser.UserName ?? "Admin",
            IsActive = true,
            Source = "Admin Direct Change",
            Created_Utc = utcNow,
            Created_By = _currentUser.UserName ?? "Admin"
        };

        await _context.EmployeePersonalLocations.AddAsync(newLoc, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<EmployeePersonalLocationDto>.Success(new EmployeePersonalLocationDto
        {
            Id = newLoc.Id,
            EmployeeId = employee.Id,
            Latitude = newLoc.Latitude,
            Longitude = newLoc.Longitude,
            AccuracyMeters = newLoc.AccuracyMeters,
            AddressDescription = newLoc.AddressDescription,
            IsApproved = true,
            ApprovedAtUtc = newLoc.ApprovedAtUtc,
            ApprovedBy = newLoc.ApprovedBy,
            IsActive = true,
            Source = newLoc.Source,
            Created_Utc = newLoc.Created_Utc
        }, "Employee location updated directly by administrator.");
    }
}
