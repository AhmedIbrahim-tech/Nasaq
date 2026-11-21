using System.Net;
using Application.Abstractions;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.AdminOperations.Commands.CorrectIncompleteAttendance;

public class CorrectIncompleteAttendanceHandler : IRequestHandler<CorrectIncompleteAttendanceCommand, GenericBaseResponse<AttendanceRecordDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CorrectIncompleteAttendanceHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<AttendanceRecordDto>> Handle(
        CorrectIncompleteAttendanceCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<AttendanceRecordDto>.Unauthorized();
        }

        var record = await _context.AttendanceRecords
            .Include(a => a.Employee)
            .Include(a => a.WorkShift)
            .Include(a => a.WorkLocation)
            .FirstOrDefaultAsync(a => a.Id == request.AttendanceRecordId, cancellationToken);

        if (record == null)
        {
            return GenericBaseResponse<AttendanceRecordDto>.Fail("Attendance record not found.", HttpStatusCode.NotFound);
        }

        if (record.CheckOutTimeUtc.HasValue && record.CheckOutStatus == VerificationStatus.Verified)
        {
            return GenericBaseResponse<AttendanceRecordDto>.Fail(
                "This attendance record already has a verified check-out.",
                HttpStatusCode.Conflict);
        }

        if (request.ManualCheckOutTimeUtc <= record.CheckInTimeUtc)
        {
            return GenericBaseResponse<AttendanceRecordDto>.Fail(
                "Manual check-out time must be after the check-in time.",
                HttpStatusCode.BadRequest);
        }

        var reviewerName = !string.IsNullOrWhiteSpace(_currentUser.UserName)
            ? _currentUser.UserName
            : _currentUser.UserId;

        record.CheckOutTimeUtc = request.ManualCheckOutTimeUtc;
        record.CheckOutStatus = VerificationStatus.Verified;
        record.CheckOutFailureReason = null;
        record.IsManuallyAdjusted = true;
        record.DurationMinutes = (int)(request.ManualCheckOutTimeUtc - record.CheckInTimeUtc).TotalMinutes;
        record.Status = AttendanceStatus.Completed;
        record.ReviewedBy = reviewerName;
        record.ReviewedAtUtc = DateTime.UtcNow;
        record.ReviewNotes = $"Manual Check-out correction: {request.Reason.Trim()}";
        record.Updated_Utc = DateTime.UtcNow;
        record.Updated_By = _currentUser.UserId;

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<AttendanceRecordDto>.Success(
            AttendanceRecordDto.FromEntity(record),
            "Incomplete attendance record corrected successfully.");
    }
}
