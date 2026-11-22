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

        // 3. Evaluate geofence compliance via Dual-Location Matrix (Approved Personal Location OR Any Active Company Location)
        var geofenceEval = await _geofenceService.EvaluateAttendanceCoordinatesAsync(
            request.Latitude,
            request.Longitude,
            request.AccuracyMeters,
            employee.Id,
            cancellationToken);

        var checkInStatus = geofenceEval.Status;
        var failureReason = geofenceEval.FailureReason;
        var measuredDistance = geofenceEval.MeasuredDistanceMeters;

        // Resolve recorded WorkLocationId (if matched company site, use that; otherwise fall back to employee assigned branch)
        var recordedLocationId = geofenceEval.MatchedLocationType == "CompanyLocation" && geofenceEval.MatchedLocationId.HasValue
            ? geofenceEval.MatchedLocationId
            : (employee.WorkLocationId ?? employee.WorkLocation?.Id);

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
            WorkLocationId = recordedLocationId,
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
        if (recordedLocationId.HasValue)
        {
            record.WorkLocation = await _context.WorkLocations.FirstOrDefaultAsync(l => l.Id == recordedLocationId.Value, cancellationToken);
        }
        record.WorkShift = shiftResolution.Shift;

        var dto = AttendanceRecordDto.FromEntity(record);

        var message = checkInStatus == VerificationStatus.Verified
            ? "Check-in recorded and verified successfully."
            : $"Check-in submitted and placed in Pending Review: {failureReason}";

        return GenericBaseResponse<AttendanceRecordDto>.Success(dto, message);
    }
}
