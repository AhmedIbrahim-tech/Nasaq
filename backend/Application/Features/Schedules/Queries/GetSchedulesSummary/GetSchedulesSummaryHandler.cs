using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Queries.GetSchedulesSummary;

public sealed class GetSchedulesSummaryHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<GetSchedulesSummaryQuery, GenericBaseResponse<SchedulesSummaryDto>>
{
    public async Task<GenericBaseResponse<SchedulesSummaryDto>> Handle(
        GetSchedulesSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var schedules = await dbContext.WorkSchedules
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var total = schedules.Count;
        var active = schedules.Count(s => s.IsActive);
        var inactive = total - active;
        var defaultSchedule = schedules.FirstOrDefault(s => s.IsDefault)?.Name;

        var assignedTotal = await dbContext.EmployeeScheduleAssignments
            .Where(a => a.IsActive)
            .Select(a => a.EmployeeId)
            .Distinct()
            .CountAsync(cancellationToken);

        var summary = new SchedulesSummaryDto(total, active, inactive, defaultSchedule, assignedTotal);
        return GenericBaseResponse<SchedulesSummaryDto>.Success(summary);
    }
}
