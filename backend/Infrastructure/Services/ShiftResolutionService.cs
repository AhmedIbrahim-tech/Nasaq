using Application.Abstractions;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ShiftResolutionService : IShiftResolutionService
{
    private readonly IApplicationDbContext _context;

    public ShiftResolutionService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ShiftResolutionResult> ResolveShiftForCheckInAsync(
        Employee employee,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        var todayDate = DateOnly.FromDateTime(utcNow);
        var currentTime = TimeOnly.FromDateTime(utcNow);
        var todayDayOfWeek = todayDate.DayOfWeek;

        // 1. Resolve employee active schedule assignment or fallback to default schedule
        var activeAssignment = await _context.EmployeeScheduleAssignments
            .Include(a => a.Schedule)
                .ThenInclude(s => s!.Days)
                    .ThenInclude(d => d.Shift)
            .Where(a => a.EmployeeId == employee.Id && a.IsActive && a.EffectiveFrom <= todayDate && (a.EffectiveTo == null || a.EffectiveTo >= todayDate))
            .OrderByDescending(a => a.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        var schedule = activeAssignment?.Schedule;

        if (schedule == null || !schedule.IsActive)
        {
            schedule = await _context.WorkSchedules
                .Include(s => s.Days)
                    .ThenInclude(d => d.Shift)
                .Where(s => s.IsDefault && s.IsActive)
                .FirstOrDefaultAsync(cancellationToken);
        }

        if (schedule == null)
        {
            return new ShiftResolutionResult(
                Shift: null,
                ShiftDate: todayDate,
                Classification: ArrivalClassification.Standard,
                IsScheduledWorkDay: true,
                NoticeMessage: "No active schedule assigned to employee or organization default."
            );
        }

        // 2. Check for overnight shift continuation from yesterday
        var yesterdayDayOfWeek = todayDate.AddDays(-1).DayOfWeek;
        var yesterdayConfig = schedule.Days.FirstOrDefault(d => d.DayOfWeek == yesterdayDayOfWeek);

        if (yesterdayConfig is { IsWorkingDay: true, Shift: { IsOvernight: true } })
        {
            var overnightShift = yesterdayConfig.Shift;
            // If currentTime is in early morning before shift end time + 2 hour grace period
            if (currentTime <= overnightShift.EndTime.AddHours(2) && currentTime < overnightShift.StartTime)
            {
                var classification = ClassifyArrival(currentTime, overnightShift, isOvernightContinuation: true);
                return new ShiftResolutionResult(
                    Shift: overnightShift,
                    ShiftDate: todayDate.AddDays(-1),
                    Classification: classification,
                    IsScheduledWorkDay: true,
                    NoticeMessage: $"Active overnight shift ({overnightShift.Name}) from yesterday."
                );
            }
        }

        // 3. Today's schedule day
        var todayConfig = schedule.Days.FirstOrDefault(d => d.DayOfWeek == todayDayOfWeek);

        if (todayConfig == null || !todayConfig.IsWorkingDay || todayConfig.Shift == null)
        {
            return new ShiftResolutionResult(
                Shift: null,
                ShiftDate: todayDate,
                Classification: ArrivalClassification.Standard,
                IsScheduledWorkDay: false,
                NoticeMessage: "Today is a scheduled rest / day off."
            );
        }

        var shift = todayConfig.Shift;
        var arrivalClassification = ClassifyArrival(currentTime, shift, isOvernightContinuation: false);

        string? notice = arrivalClassification switch
        {
            ArrivalClassification.Early => "Arrival recorded early before standard shift start.",
            ArrivalClassification.Late => "Late arrival recorded beyond late tolerance window.",
            ArrivalClassification.AfterCutoff => "Arrival recorded after shift cutoff threshold.",
            ArrivalClassification.OnTime => "On-time arrival recorded within shift window.",
            _ => null
        };

        return new ShiftResolutionResult(
            Shift: shift,
            ShiftDate: todayDate,
            Classification: arrivalClassification,
            IsScheduledWorkDay: true,
            NoticeMessage: notice
        );
    }

    private static ArrivalClassification ClassifyArrival(TimeOnly currentTime, WorkShift shift, bool isOvernightContinuation)
    {
        // 1. Cutoff: if after cutoff threshold, classify as AfterCutoff (DEC-004)
        if (shift.CutoffTime.HasValue)
        {
            if (shift.IsOvernight)
            {
                if (isOvernightContinuation && currentTime > shift.CutoffTime.Value)
                    return ArrivalClassification.AfterCutoff;
            }
            else
            {
                if (currentTime > shift.CutoffTime.Value)
                    return ArrivalClassification.AfterCutoff;
            }
        }

        // 2. Late window: if after late threshold, classify as Late
        if (shift.LateStartTime.HasValue)
        {
            if (!isOvernightContinuation && currentTime > shift.LateStartTime.Value)
                return ArrivalClassification.Late;
        }

        // 3. Early window: arrival before shift start time (DEC-003)
        if (!isOvernightContinuation)
        {
            if (currentTime < shift.StartTime)
            {
                return ArrivalClassification.Early;
            }
        }

        // 4. On-time window: arrival at or after start time within grace period
        var lateWindow = shift.LateStartTime ?? shift.StartTime.AddMinutes(15);
        if (currentTime >= shift.StartTime && currentTime <= lateWindow)
        {
            return ArrivalClassification.OnTime;
        }

        return ArrivalClassification.Standard;
    }
}
