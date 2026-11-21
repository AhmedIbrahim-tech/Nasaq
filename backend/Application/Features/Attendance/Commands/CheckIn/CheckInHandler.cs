using Application.Abstractions;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Attendance.Commands.CheckIn;

public class CheckInHandler : IRequestHandler<CheckInCommand, GenericBaseResponse<AttendanceRecordDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;
    private readonly IGeofenceService _geofenceService;
    private readonly IShiftResolutionService _shiftResolutionService;
    private readonly IPointCalculationEngine _pointCalculationEngine;

    public CheckInHandler(
        IApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser,
        IGeofenceService geofenceService,
        IShiftResolutionService shiftResolutionService,
        IPointCalculationEngine pointCalculationEngine)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _geofenceService = geofenceService;
        _shiftResolutionService = shiftResolutionService;
        _pointCalculationEngine = pointCalculationEngine;
    }

    public async Task<GenericBaseResponse<AttendanceRecordDto>> Handle(CheckInCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<AttendanceRecordDto>.Unauthorized("User is not authenticated.");
        }

        // 1. Resolve active employee profile
        var employee = await _context.Employees
            .Include(e => e.WorkLocation)
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<AttendanceRecordDto>.Fail(
                "No active employee profile is linked to the authenticated user.", HttpStatusCode.Forbidden);
        }

        // 2. Prevent duplicate open check-in sessions
        var existingOpenRecord = await _context.AttendanceRecords
            .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.CheckOutTimeUtc == null, cancellationToken);

        if (existingOpenRecord != null)
        {
            return GenericBaseResponse<AttendanceRecordDto>.Conflict(
                $"You already have an active check-in recorded at {existingOpenRecord.CheckInTimeUtc:HH:mm} UTC. Please check out before submitting another arrival.");
        }

        var utcNow = DateTime.UtcNow;

        // 3. Resolve location and validate geofence
        var location = employee.WorkLocation;
        if (location == null && employee.WorkLocationId.HasValue)
        {
            location = await _context.WorkLocations.FirstOrDefaultAsync(l => l.Id == employee.WorkLocationId.Value, cancellationToken);
        }

        var checkInStatus = VerificationStatus.Verified;
        string? failureReason = null;
        double? measuredDistance = null;

        if (location != null && location.IsActive)
        {
            var hasCoords = _geofenceService.IsValidCoordinate(request.Latitude, request.Longitude);
            if (hasCoords)
            {
                var isWithin = _geofenceService.IsWithinGeofence(
                    request.Latitude!.Value,
                    request.Longitude!.Value,
                    location.Latitude,
                    location.Longitude,
                    location.RadiusMeters,
                    out var dist);

                measuredDistance = Math.Round(dist, 1);

                if (request.AccuracyMeters.HasValue && request.AccuracyMeters.Value > location.AccuracyThresholdMeters)
                {
                    checkInStatus = VerificationStatus.PendingReview;
                    failureReason = $"low_accuracy: device reported {request.AccuracyMeters.Value}m, threshold is {location.AccuracyThresholdMeters}m";
                }
                else if (!isWithin)
                {
                    checkInStatus = VerificationStatus.PendingReview;
                    failureReason = $"outside_geofence: {measuredDistance}m from worksite (radius: {location.RadiusMeters}m)";
                }
                else
                {
                    checkInStatus = VerificationStatus.Verified;
                }
            }
            else
            {
                checkInStatus = VerificationStatus.PendingReview;
                failureReason = "gps_unavailable: device coordinates were not provided or invalid";
            }
        }
        else
        {
            checkInStatus = VerificationStatus.PendingReview;
            failureReason = location == null ? "unassigned_worksite: employee has no assigned location" : "inactive_worksite: assigned location is currently inactive";
        }

        // 4. Resolve shift and arrival classification
        var shiftResolution = await _shiftResolutionService.ResolveShiftForCheckInAsync(employee, utcNow, cancellationToken);

        // 5. Create AttendanceRecord
        var overallStatus = checkInStatus == VerificationStatus.Verified
            ? AttendanceStatus.Present
            : AttendanceStatus.PendingReview;

        var record = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Date = shiftResolution.ShiftDate,
            WorkLocationId = location?.Id,
            WorkShiftId = shiftResolution.Shift?.Id,

            CheckInTimeUtc = utcNow,
            CheckInLatitude = request.Latitude,
            CheckInLongitude = request.Longitude,
            CheckInAccuracyMeters = request.AccuracyMeters,
            CheckInDistanceMeters = measuredDistance,
            CheckInStatus = checkInStatus,
            CheckInFailureReason = failureReason,
            ArrivalClassification = shiftResolution.Classification,

            Status = overallStatus,
            CheckInDeviceInfo = request.DeviceInfo,
            Notes = request.Notes,

            Created_Utc = utcNow,
            Created_By = _currentUser.UserName ?? employee.EmployeeCode
        };

        await _context.AttendanceRecords.AddAsync(record, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Evaluate point rules for arrival event
        await _pointCalculationEngine.EvaluateAttendanceEventAsync(record, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Re-load references for response
        record.Employee = employee;
        record.WorkLocation = location;
        record.WorkShift = shiftResolution.Shift;

        var dto = AttendanceRecordDto.FromEntity(record);

        var message = checkInStatus == VerificationStatus.Verified
            ? "Check-in recorded and verified successfully."
            : $"Check-in submitted and placed in Pending Review: {failureReason}";

        return GenericBaseResponse<AttendanceRecordDto>.Success(dto, message);
    }
}
