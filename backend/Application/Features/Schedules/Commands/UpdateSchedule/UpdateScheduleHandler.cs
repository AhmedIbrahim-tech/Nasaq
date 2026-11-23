using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Commands.UpdateSchedule;

public sealed class UpdateScheduleHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser
) : IRequestHandler<UpdateScheduleCommand, GenericBaseResponse<WorkScheduleDto>>
{
    public async Task<GenericBaseResponse<WorkScheduleDto>> Handle(
        UpdateScheduleCommand request,
        CancellationToken cancellationToken)
    {
        var schedule = await dbContext.WorkSchedules
            .Include(s => s.Days)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (schedule is null)
        {
            return GenericBaseResponse<WorkScheduleDto>.Fail(
                "Work schedule not found.",
                HttpStatusCode.NotFound);
        }

        var nameAr = !string.IsNullOrWhiteSpace(request.NameAr) ? request.NameAr.Trim() : null;
        var nameEn = !string.IsNullOrWhiteSpace(request.NameEn)
            ? request.NameEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Name) ? request.Name.Trim() : (nameAr ?? string.Empty));
        var descAr = !string.IsNullOrWhiteSpace(request.DescriptionAr) ? request.DescriptionAr.Trim() : null;
        var descEn = !string.IsNullOrWhiteSpace(request.DescriptionEn)
            ? request.DescriptionEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Description) ? request.Description.Trim() : null);

        var trimmedName = nameEn;
        var nameExists = await dbContext.WorkSchedules
            .AnyAsync(s => s.Id != request.Id &&
                           ((s.Name == trimmedName) ||
                            (nameAr != null && s.NameAr != null && s.NameAr == nameAr)),
                      cancellationToken);

        if (nameExists)
        {
            return GenericBaseResponse<WorkScheduleDto>.Fail(
                "Another work schedule with this name already exists.",
                HttpStatusCode.Conflict);
        }

        // Validate shift IDs
        var shiftIds = request.Days?
            .Where(d => d.IsWorkingDay && d.WorkShiftId.HasValue)
            .Select(d => d.WorkShiftId!.Value)
            .Distinct()
            .ToList() ?? [];

        if (shiftIds.Count > 0)
        {
            var validShiftCount = await dbContext.WorkShifts
                .CountAsync(s => shiftIds.Contains(s.Id), cancellationToken);

            if (validShiftCount != shiftIds.Count)
            {
                return GenericBaseResponse<WorkScheduleDto>.Fail(
                    "One or more referenced work shifts do not exist.",
                    HttpStatusCode.BadRequest);
            }
        }

        // If IsDefault set, clear existing defaults
        if (request.IsDefault && !schedule.IsDefault)
        {
            var existingDefaults = await dbContext.WorkSchedules
                .Where(s => s.IsDefault && s.Id != schedule.Id)
                .ToListAsync(cancellationToken);

            foreach (var d in existingDefaults)
            {
                d.IsDefault = false;
            }
        }

        schedule.Name = trimmedName;
        schedule.NameAr = nameAr;
        schedule.Description = descEn;
        schedule.DescriptionAr = descAr;
        schedule.IsActive = request.IsActive;
        schedule.IsDefault = request.IsDefault;
        schedule.Updated_Utc = DateTime.UtcNow;
        schedule.Updated_By = currentUser.UserId;

        // Update Days if provided
        if (request.Days != null && request.Days.Count > 0)
        {
            var inputDays = request.Days.ToDictionary(d => d.DayOfWeek);
            foreach (var day in schedule.Days)
            {
                if (inputDays.TryGetValue(day.DayOfWeek, out var inputDay))
                {
                    day.IsWorkingDay = inputDay.IsWorkingDay;
                    day.WorkShiftId = inputDay.IsWorkingDay ? inputDay.WorkShiftId : null;
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        // Fetch back with shifts for DTO mapping
        var savedDays = await dbContext.WorkScheduleDays
            .Include(d => d.Shift)
            .Where(d => d.WorkScheduleId == schedule.Id)
            .OrderBy(d => d.DayOfWeek)
            .ToListAsync(cancellationToken);

        var assignedCount = await dbContext.EmployeeScheduleAssignments
            .CountAsync(a => a.WorkScheduleId == schedule.Id && a.IsActive, cancellationToken);

        var dayDtos = savedDays.Select(d => new WorkScheduleDayDto(
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
            schedule.Updated_By,
            schedule.NameAr,
            schedule.DescriptionAr
        );

        return GenericBaseResponse<WorkScheduleDto>.Success(dto, "Work schedule updated successfully.");
    }
}
