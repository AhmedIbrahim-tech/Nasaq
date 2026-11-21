using System.Net;
using Application.Abstractions;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.AdminOperations.Commands.RejectGpsException;

public class RejectGpsExceptionHandler : IRequestHandler<RejectGpsExceptionCommand, GenericBaseResponse<AttendanceRecordDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public RejectGpsExceptionHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<AttendanceRecordDto>> Handle(
        RejectGpsExceptionCommand request,
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

        var reviewerName = !string.IsNullOrWhiteSpace(_currentUser.UserName)
            ? _currentUser.UserName
            : _currentUser.UserId;

        var targetEventType = request.EventType;
        if (string.IsNullOrWhiteSpace(targetEventType) || targetEventType.Equals("CheckIn", StringComparison.OrdinalIgnoreCase))
        {
            if (record.CheckInStatus != VerificationStatus.PendingReview && record.CheckOutStatus == VerificationStatus.PendingReview)
            {
                targetEventType = "CheckOut";
            }
            else
            {
                targetEventType = "CheckIn";
            }
        }

        var isCheckIn = targetEventType.Equals("CheckIn", StringComparison.OrdinalIgnoreCase);

        if (isCheckIn)
        {
            if (record.CheckInStatus != VerificationStatus.PendingReview)
            {
                return GenericBaseResponse<AttendanceRecordDto>.Fail(
                    $"Check-in is not in PendingReview status (current status: {record.CheckInStatus}).",
                    HttpStatusCode.BadRequest);
            }

            // 1. Update case status to Rejected
            record.CheckInStatus = VerificationStatus.Rejected;
            record.Status = AttendanceStatus.Rejected;
            record.ReviewedBy = reviewerName;
            record.ReviewedAtUtc = DateTime.UtcNow;
            record.ReviewNotes = request.Reason.Trim();

            // 2. Cancel/Reverse any pending points for this event (awards zero points, no automatic absence penalty)
            var pendingPoints = await _context.PointTransactions
                .Where(t => t.SourceEventId == record.Id && t.Status == PointTransactionStatus.PendingReview)
                .ToListAsync(cancellationToken);

            foreach (var tx in pendingPoints)
            {
                tx.Status = PointTransactionStatus.Reversed;
                tx.Reason = $"{tx.Reason} (Rejected by {reviewerName}: {request.Reason.Trim()})";
                tx.Updated_Utc = DateTime.UtcNow;
                tx.Updated_By = _currentUser.UserId;
            }
        }
        else // CheckOut
        {
            if (record.CheckOutStatus != VerificationStatus.PendingReview)
            {
                return GenericBaseResponse<AttendanceRecordDto>.Fail(
                    $"Check-out is not in PendingReview status (current status: {record.CheckOutStatus}).",
                    HttpStatusCode.BadRequest);
            }

            record.CheckOutStatus = VerificationStatus.Rejected;
            record.Status = AttendanceStatus.Rejected;
            record.ReviewedBy = reviewerName;
            record.ReviewedAtUtc = DateTime.UtcNow;
            record.ReviewNotes = request.Reason.Trim();

            var pendingPoints = await _context.PointTransactions
                .Where(t => t.SourceEventId == record.Id &&
                            t.EventType == PointEventType.CompletedShift &&
                            t.Status == PointTransactionStatus.PendingReview)
                .ToListAsync(cancellationToken);

            foreach (var tx in pendingPoints)
            {
                tx.Status = PointTransactionStatus.Reversed;
                tx.Updated_Utc = DateTime.UtcNow;
                tx.Updated_By = _currentUser.UserId;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<AttendanceRecordDto>.Success(
            AttendanceRecordDto.FromEntity(record),
            "Attendance exception rejected successfully.");
    }
}
