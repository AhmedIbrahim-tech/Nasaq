using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Commands.ToggleScheduleStatus;

public sealed class ToggleScheduleStatusHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser
) : IRequestHandler<ToggleScheduleStatusCommand, GenericBaseResponse<WorkScheduleDto>>
{
    public async Task<GenericBaseResponse<WorkScheduleDto>> Handle(
        ToggleScheduleStatusCommand request,
        CancellationToken cancellationToken)
    {
        var schedule = await dbContext.WorkSchedules
            .Include(s => s.Days)
                .ThenInclude(d => d.Shift)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (schedule is null)
        {
            return GenericBaseResponse<WorkScheduleDto>.Fail(
                "Work schedule not found.",
                HttpStatusCode.NotFound);
        }

        schedule.IsActive = request.IsActive ?? !schedule.IsActive;
        schedule.Updated_Utc = DateTime.UtcNow;
        schedule.Updated_By = currentUser.UserId;

        await dbContext.SaveChangesAsync(cancellationToken);

        var assignedCount = await dbContext.EmployeeScheduleAssignments
            .CountAsync(a => a.WorkScheduleId == schedule.Id && a.IsActive, cancellationToken);

        var dayDtos = schedule.Days.OrderBy(d => d.DayOfWeek).Select(d => new WorkScheduleDayDto(
            d.Id,
            d.DayOfWeek,
            d.DayOfWeek.ToString(),
            d.IsWorkingDay,
            d.WorkShiftId,
            d.Shift?.Name,
            d.Shift?.StartTime,
            d.Shift?.EndTime,
            d.Shift?.IsOvernight,
            d.Shift?.DurationHours
        )).ToList();

        var dto = new WorkScheduleDto(
            schedule.Id,
            schedule.Name,
            schedule.Description,
            schedule.IsActive,
            schedule.IsDefault,
            dayDtos,
            assignedCount,
            schedule.Created_Utc,
            schedule.Created_By,
            schedule.Updated_Utc,
            schedule.Updated_By
        );

        return GenericBaseResponse<WorkScheduleDto>.Success(dto, $"Work schedule status changed to {(schedule.IsActive ? "active" : "inactive")}.");
    }
}
