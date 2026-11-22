using Application.Abstractions;
using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.EmployeeLocations.Commands.RegisterEmployeeLocation;

public class RegisterEmployeeLocationHandler : IRequestHandler<RegisterEmployeeLocationCommand, GenericBaseResponse<MyLocationStatusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IGeofenceService _geofenceService;

    public RegisterEmployeeLocationHandler(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IGeofenceService geofenceService)
    {
        _context = context;
        _currentUser = currentUser;
        _geofenceService = geofenceService;
    }

    public async Task<GenericBaseResponse<MyLocationStatusDto>> Handle(RegisterEmployeeLocationCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
            return GenericBaseResponse<MyLocationStatusDto>.Unauthorized("User is not authenticated.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
            return GenericBaseResponse<MyLocationStatusDto>.Fail("No active employee profile linked to current user.", HttpStatusCode.Forbidden);

        // Check for existing pending request (One Pending Request Rule)
        var existingPending = await _context.EmployeeLocationRequests
            .FirstOrDefaultAsync(r => r.EmployeeId == employee.Id && r.Status == LocationRequestStatus.Pending, cancellationToken);

        if (existingPending != null)
            return GenericBaseResponse<MyLocationStatusDto>.Conflict("You already have a location request awaiting administrator review.");

        var utcNow = DateTime.UtcNow;
        var globalRadius = await _geofenceService.GetGlobalRadiusMetersAsync(cancellationToken);

        // Check if proposed point matches an active company location
        var activeCompanyLocs = await _context.WorkLocations
            .AsNoTracking()
            .Where(w => w.IsActive)
            .ToListAsync(cancellationToken);

        bool matchesCompany = false;
        string? matchedCompanyName = null;

        foreach (var loc in activeCompanyLocs)
        {
            if (_geofenceService.IsValidCoordinate(loc.Latitude, loc.Longitude))
            {
                var dist = _geofenceService.CalculateDistanceMeters(request.Latitude, request.Longitude, loc.Latitude, loc.Longitude);
                if (dist <= globalRadius)
                {
                    matchesCompany = true;
                    matchedCompanyName = loc.Name;
                    break;
                }
            }
        }

        if (matchesCompany)
        {
            // Auto-approve: System / Company Location Match
            var oldLocations = await _context.EmployeePersonalLocations
                .Where(l => l.EmployeeId == employee.Id && l.IsActive)
                .ToListAsync(cancellationToken);

            foreach (var old in oldLocations)
                old.IsActive = false;

            var approvedLocation = new EmployeePersonalLocation
            {
                Id = Guid.NewGuid(),
                EmployeeId = employee.Id,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                AccuracyMeters = request.AccuracyMeters,
                AddressDescription = request.AddressDescription ?? matchedCompanyName,
                IsApproved = true,
                ApprovedAtUtc = utcNow,
                ApprovedBy = "System / Company Location Match",
                IsActive = true,
                Source = "System / Company Location Match",
                Created_Utc = utcNow,
                Created_By = _currentUser.UserName ?? employee.EmployeeCode
            };

            var resolvedRequest = new EmployeeLocationRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = employee.Id,
                RequestType = LocationRequestType.InitialRegistration,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                AccuracyMeters = request.AccuracyMeters,
                AddressDescription = request.AddressDescription ?? matchedCompanyName,
                Status = LocationRequestStatus.Approved,
                ReviewedAtUtc = utcNow,
                ReviewedBy = "System / Company Location Match",
                AdminNotes = $"Auto-approved: matched company site '{matchedCompanyName}'",
                Created_Utc = utcNow,
                Created_By = _currentUser.UserName ?? employee.EmployeeCode
            };

            await _context.EmployeePersonalLocations.AddAsync(approvedLocation, cancellationToken);
            await _context.EmployeeLocationRequests.AddAsync(resolvedRequest, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return GenericBaseResponse<MyLocationStatusDto>.Success(new MyLocationStatusDto
            {
                ApprovedLocation = new EmployeePersonalLocationDto
                {
                    Id = approvedLocation.Id,
                    EmployeeId = employee.Id,
                    Latitude = approvedLocation.Latitude,
                    Longitude = approvedLocation.Longitude,
                    AccuracyMeters = approvedLocation.AccuracyMeters,
                    AddressDescription = approvedLocation.AddressDescription,
                    IsApproved = true,
                    ApprovedAtUtc = approvedLocation.ApprovedAtUtc,
                    ApprovedBy = approvedLocation.ApprovedBy,
                    IsActive = true,
                    Source = approvedLocation.Source,
                    Created_Utc = approvedLocation.Created_Utc
                }
            }, "Location registered and approved automatically as it matches an official company location.");
        }

        // Outside company locations: Create Pending Request
        var pendingRequest = new EmployeeLocationRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            RequestType = LocationRequestType.InitialRegistration,
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

        return GenericBaseResponse<MyLocationStatusDto>.Success(new MyLocationStatusDto
        {
            PendingRequest = new EmployeeLocationRequestDto
            {
                Id = pendingRequest.Id,
                EmployeeId = employee.Id,
                RequestType = pendingRequest.RequestType,
                Latitude = pendingRequest.Latitude,
                Longitude = pendingRequest.Longitude,
                AccuracyMeters = pendingRequest.AccuracyMeters,
                AddressDescription = pendingRequest.AddressDescription,
                Status = pendingRequest.Status,
                Created_Utc = pendingRequest.Created_Utc
            }
        }, "Location registration submitted successfully and is awaiting administrator review.");
    }
}
