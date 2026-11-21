using Application.Abstractions;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class LeaveService : ILeaveService
{
    private readonly IApplicationDbContext _context;

    public LeaveService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsOnApprovedLeaveAsync(
        Guid employeeId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        return await _context.LeaveRequests
            .AsNoTracking()
            .AnyAsync(r =>
                r.EmployeeId == employeeId &&
                r.Status == LeaveRequestStatus.Approved &&
                r.StartDate <= date &&
                r.EndDate >= date,
                cancellationToken);
    }

    public async Task<int> CalculateLeaveDurationAsync(
        Guid employeeId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        if (endDate < startDate)
        {
            return 0;
        }

        // 1. Resolve employee schedule assignment covering the start date
        var assignment = await _context.EmployeeScheduleAssignments
            .AsNoTracking()
            .Include(a => a.Schedule)
                .ThenInclude(s => s!.Days)
            .Where(a =>
                a.EmployeeId == employeeId &&
                a.IsActive &&
                a.EffectiveFrom <= startDate &&
                (a.EffectiveTo == null || a.EffectiveTo >= startDate))
            .OrderByDescending(a => a.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        var schedule = assignment?.Schedule;

        if (schedule == null || !schedule.IsActive)
        {
            schedule = await _context.WorkSchedules
                .AsNoTracking()
                .Include(s => s.Days)
                .Where(s => s.IsDefault && s.IsActive)
                .FirstOrDefaultAsync(cancellationToken);
        }

        // If no schedule configured, default to inclusive calendar days
        if (schedule == null || !schedule.Days.Any())
        {
            return endDate.DayNumber - startDate.DayNumber + 1;
        }

        // Calculate working days within date range
        int workingDays = 0;
        var workingDaysSet = schedule.Days
            .Where(d => d.IsWorkingDay)
            .Select(d => d.DayOfWeek)
            .ToHashSet();

        for (var current = startDate; current <= endDate; current = current.AddDays(1))
        {
            if (workingDaysSet.Contains(current.DayOfWeek))
            {
                workingDays++;
            }
        }

        // If all days fall on rest days (e.g. weekend), default to at least 1 day
        return Math.Max(1, workingDays);
    }

    public async Task<bool> HasOverlappingLeaveAsync(
        Guid employeeId,
        DateOnly startDate,
        DateOnly endDate,
        Guid? excludeRequestId = null,
        CancellationToken cancellationToken = default)
    {
        return await _context.LeaveRequests
            .AsNoTracking()
            .AnyAsync(r =>
                r.EmployeeId == employeeId &&
                (excludeRequestId == null || r.Id != excludeRequestId.Value) &&
                (r.Status == LeaveRequestStatus.Pending || r.Status == LeaveRequestStatus.Approved) &&
                r.StartDate <= endDate &&
                r.EndDate >= startDate,
                cancellationToken);
    }
}
