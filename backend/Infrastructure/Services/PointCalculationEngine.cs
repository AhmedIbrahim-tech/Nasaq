using Application.Abstractions;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class PointCalculationEngine : IPointCalculationEngine
{
    private readonly IApplicationDbContext _context;

    public PointCalculationEngine(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PointTransaction>> EvaluateAttendanceEventAsync(
        AttendanceRecord attendance,
        CancellationToken cancellationToken = default)
    {
        var generatedTransactions = new List<PointTransaction>();
        var today = attendance.Date;

        // Load all active rules effective on attendance date
        var activeRules = await _context.PointRules
            .Where(r => r.IsActive && r.EffectiveFrom <= today && (r.EffectiveTo == null || r.EffectiveTo >= today))
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (!activeRules.Any())
        {
            return generatedTransactions;
        }

        // Determine transaction status: if attendance is pending review (e.g. GPS outside geofence), points are PendingReview
        var isPendingReview = attendance.Status == AttendanceStatus.PendingReview ||
                              attendance.CheckInStatus == VerificationStatus.PendingReview ||
                              attendance.CheckOutStatus == VerificationStatus.PendingReview;

        var txStatus = isPendingReview ? PointTransactionStatus.PendingReview : PointTransactionStatus.Finalized;

        // Check 1: Arrival Classification Rules
        PointEventType? arrivalEvent = attendance.ArrivalClassification switch
        {
            ArrivalClassification.Early => PointEventType.EarlyArrival,
            ArrivalClassification.OnTime => PointEventType.OnTimeArrival,
            ArrivalClassification.Late => PointEventType.LateArrival,
            ArrivalClassification.AfterCutoff => PointEventType.AfterCutoffArrival,
            _ => null
        };

        if (arrivalEvent.HasValue)
        {
            var matchingRule = activeRules.FirstOrDefault(r => r.EventType == arrivalEvent.Value);
            if (matchingRule != null)
            {
                // Strict idempotency check: has this attendance record already generated points for this rule?
                var alreadyProcessed = await _context.PointTransactions
                    .AnyAsync(t => t.EmployeeId == attendance.EmployeeId &&
                                   t.SourceEventId == attendance.Id &&
                                   t.RuleId == matchingRule.Id &&
                                   t.Status != PointTransactionStatus.Reversed,
                                   cancellationToken);

                if (!alreadyProcessed)
                {
                    var arrivalTx = new PointTransaction
                    {
                        EmployeeId = attendance.EmployeeId,
                        RuleId = matchingRule.Id,
                        Category = matchingRule.Category,
                        EventType = matchingRule.EventType,
                        Points = matchingRule.Points,
                        Status = txStatus,
                        SourceEventType = nameof(AttendanceRecord),
                        SourceEventId = attendance.Id,
                        Date = attendance.Date,
                        TimestampUtc = DateTime.UtcNow,
                        Reason = $"{matchingRule.Name} — {arrivalEvent.Value} on {attendance.Date:yyyy-MM-dd}"
                    };

                    _context.PointTransactions.Add(arrivalTx);
                    generatedTransactions.Add(arrivalTx);
                }
            }
        }

        // Check 2: Shift Completion Rules (if checked out)
        if (attendance.CheckOutTimeUtc.HasValue && attendance.Status == AttendanceStatus.Completed)
        {
            var completionRule = activeRules.FirstOrDefault(r => r.EventType == PointEventType.CompletedShift);
            if (completionRule != null)
            {
                var alreadyProcessed = await _context.PointTransactions
                    .AnyAsync(t => t.EmployeeId == attendance.EmployeeId &&
                                   t.SourceEventId == attendance.Id &&
                                   t.RuleId == completionRule.Id &&
                                   t.Status != PointTransactionStatus.Reversed,
                                   cancellationToken);

                if (!alreadyProcessed)
                {
                    var completionTx = new PointTransaction
                    {
                        EmployeeId = attendance.EmployeeId,
                        RuleId = completionRule.Id,
                        Category = completionRule.Category,
                        EventType = completionRule.EventType,
                        Points = completionRule.Points,
                        Status = txStatus,
                        SourceEventType = nameof(AttendanceRecord),
                        SourceEventId = attendance.Id,
                        Date = attendance.Date,
                        TimestampUtc = DateTime.UtcNow,
                        Reason = $"{completionRule.Name} — Shift completed ({attendance.DurationMinutes ?? 0} mins) on {attendance.Date:yyyy-MM-dd}"
                    };

                    _context.PointTransactions.Add(completionTx);
                    generatedTransactions.Add(completionTx);
                }
            }
        }

        return generatedTransactions;
    }

    /// <summary>
    /// Checks whether the specified employee is covered by an approved leave request on the given date.
    /// Employees on approved leave are exempt from unexcused absence penalties and disciplinary deductions.
    /// </summary>
    public async Task<bool> IsEmployeeOnApprovedLeaveAsync(
        Guid employeeId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        return await _context.LeaveRequests
            .AsNoTracking()
            .AnyAsync(l => l.EmployeeId == employeeId &&
                           l.Status == LeaveRequestStatus.Approved &&
                           l.StartDate <= date && l.EndDate >= date,
                      cancellationToken);
    }
}
