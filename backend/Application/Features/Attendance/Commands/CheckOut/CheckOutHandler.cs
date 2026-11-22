using Application.Abstractions;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Attendance.Commands.CheckOut;

public class CheckOutHandler : IRequestHandler<CheckOutCommand, GenericBaseResponse<AttendanceRecordDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;
    private readonly IGeofenceService _geofenceService;
    private readonly IPointCalculationEngine _pointCalculationEngine;

    public CheckOutHandler(
        IApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser,
        IGeofenceService geofenceService,
        IPointCalculationEngine pointCalculationEngine)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _geofenceService = geofenceService;
        _pointCalculationEngine = pointCalculationEngine;
    }

    public async Task<GenericBaseResponse<AttendanceRecordDto>> Handle(CheckOutCommand request, CancellationToken cancellationToken)
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

        // 2. Resolve open attendance record
        var record = await _context.AttendanceRecords
            .Include(a => a.WorkLocation)
            .Include(a => a.WorkShift)
            .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.CheckOutTimeUtc == null, cancellationToken);

        if (record == null)
        {
            // Check if user already completed check-out
            var latestRecord = await _context.AttendanceRecords
                .Where(a => a.EmployeeId == employee.Id)
                .OrderByDescending(a => a.CheckInTimeUtc)
                .FirstOrDefaultAsync(cancellationToken);

            if (latestRecord?.CheckOutTimeUtc != null)
            {
                return GenericBaseResponse<AttendanceRecordDto>.Conflict(
                    $"Your departure was already recorded at {latestRecord.CheckOutTimeUtc:HH:mm} UTC.");
            }

            return GenericBaseResponse<AttendanceRecordDto>.Fail(
                "Cannot check out: No active arrival check-in found. Please check in first.", HttpStatusCode.BadRequest);
        }

        var utcNow = DateTime.UtcNow;

        // 3. Evaluate geofence compliance via Dual-Location Matrix (Approved Personal Location OR Any Active Company Location)
        var geofenceEval = await _geofenceService.EvaluateAttendanceCoordinatesAsync(
            request.Latitude,
            request.Longitude,
            request.AccuracyMeters,
            employee.Id,
            cancellationToken);

        var checkOutStatus = geofenceEval.Status;
        var failureReason = geofenceEval.FailureReason;
        var measuredDistance = geofenceEval.MeasuredDistanceMeters;

        // 4. Update the Attendance Record
        record.CheckOutTimeUtc = utcNow;
        record.CheckOutLatitude = request.Latitude;
        record.CheckOutLongitude = request.Longitude;
        record.CheckOutAccuracyMeters = request.AccuracyMeters;
        record.CheckOutDistanceMeters = measuredDistance;
        record.CheckOutStatus = checkOutStatus;
        record.CheckOutFailureReason = failureReason;
        record.CheckOutDeviceInfo = request.DeviceInfo;

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            record.Notes = string.IsNullOrWhiteSpace(record.Notes)
                ? $"Check-out note: {request.Notes}"
                : $"{record.Notes} | Check-out note: {request.Notes}";
        }

        // Calculate presence duration
        var diff = utcNow - record.CheckInTimeUtc;
        record.DurationMinutes = (int)Math.Max(0, diff.TotalMinutes);

        // Overall status
        record.Status = (record.CheckInStatus == VerificationStatus.Verified && checkOutStatus == VerificationStatus.Verified)
            ? AttendanceStatus.Completed
            : AttendanceStatus.PendingReview;

        record.Updated_Utc = utcNow;
        record.Updated_By = _currentUser.UserName ?? employee.EmployeeCode;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Evaluate point rules for departure and shift completion event
        await _pointCalculationEngine.EvaluateAttendanceEventAsync(record, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        record.Employee = employee;
        var dto = AttendanceRecordDto.FromEntity(record);

        var message = checkOutStatus == VerificationStatus.Verified
            ? $"Check-out confirmed successfully. Duration: {dto.DurationHours:F1} hrs."
            : $"Check-out recorded and placed in Pending Review: {failureReason}";

        return GenericBaseResponse<AttendanceRecordDto>.Success(dto, message);
    }
}
