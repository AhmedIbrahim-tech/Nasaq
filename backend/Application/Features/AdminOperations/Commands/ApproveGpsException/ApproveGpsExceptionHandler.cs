using System.Net;
using Application.Abstractions;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.AdminOperations.Commands.ApproveGpsException;

public class ApproveGpsExceptionHandler : IRequestHandler<ApproveGpsExceptionCommand, GenericBaseResponse<AttendanceRecordDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPointCalculationEngine _pointCalculationEngine;

    public ApproveGpsExceptionHandler(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IPointCalculationEngine pointCalculationEngine)
    {
        _context = context;
        _currentUser = currentUser;
        _pointCalculationEngine = pointCalculationEngine;
    }

    public async Task<GenericBaseResponse<AttendanceRecordDto>> Handle(
        ApproveGpsExceptionCommand request,
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

            // 1. Preserve original server-recorded timestamp
            // 2. Transition status to Verified
            record.CheckInStatus = VerificationStatus.Verified;
            record.Status = record.CheckOutStatus == VerificationStatus.Verified
                ? AttendanceStatus.Completed
                : AttendanceStatus.Present;

            record.ReviewedBy = reviewerName;
            record.ReviewedAtUtc = DateTime.UtcNow;
            record.ReviewNotes = string.IsNullOrWhiteSpace(request.Notes)
                ? "Approved by administrator"
                : request.Notes.Trim();

            // 3. Finalize or generate eligible points under DEC-007 (using original timestamp)
            var pendingPoints = await _context.PointTransactions
                .Where(t => t.SourceEventId == record.Id && t.Status == PointTransactionStatus.PendingReview)
                .ToListAsync(cancellationToken);

            if (pendingPoints.Any())
            {
                foreach (var tx in pendingPoints)
                {
                    tx.Status = PointTransactionStatus.Finalized;
                    tx.Reason = $"{tx.Reason} (Approved by {reviewerName})";
                    tx.Updated_Utc = DateTime.UtcNow;
                    tx.Updated_By = _currentUser.UserId;
                }
            }
            else
            {
                // If points were not generated yet, evaluate with the verified record
                var newPoints = await _pointCalculationEngine.EvaluateAttendanceEventAsync(record, cancellationToken);
                foreach (var tx in newPoints)
                {
                    tx.Status = PointTransactionStatus.Finalized;
                }
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

            record.CheckOutStatus = VerificationStatus.Verified;
            if (record.CheckInStatus == VerificationStatus.Verified)
            {
                record.Status = AttendanceStatus.Completed;
            }

            record.ReviewedBy = reviewerName;
            record.ReviewedAtUtc = DateTime.UtcNow;
            record.ReviewNotes = string.IsNullOrWhiteSpace(request.Notes)
                ? "Check-out approved by administrator"
                : request.Notes.Trim();

            // Finalize any pending shift-completion points if present
            var pendingCompletionPoints = await _context.PointTransactions
                .Where(t => t.SourceEventId == record.Id &&
                            t.EventType == PointEventType.CompletedShift &&
                            t.Status == PointTransactionStatus.PendingReview)
                .ToListAsync(cancellationToken);

            foreach (var tx in pendingCompletionPoints)
            {
                tx.Status = PointTransactionStatus.Finalized;
                tx.Updated_Utc = DateTime.UtcNow;
                tx.Updated_By = _currentUser.UserId;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<AttendanceRecordDto>.Success(
            AttendanceRecordDto.FromEntity(record),
            "Attendance exception approved successfully.");
    }
}
