using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Commands.CreateSchedule;

public sealed class CreateScheduleHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser
) : IRequestHandler<CreateScheduleCommand, GenericBaseResponse<WorkScheduleDto>>
{
    public async Task<GenericBaseResponse<WorkScheduleDto>> Handle(
        CreateScheduleCommand request,
        CancellationToken cancellationToken)
    {
        var nameAr = !string.IsNullOrWhiteSpace(request.NameAr) ? request.NameAr.Trim() : null;
        var nameEn = !string.IsNullOrWhiteSpace(request.NameEn)
            ? request.NameEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Name) ? request.Name.Trim() : (nameAr ?? string.Empty));
        var descAr = !string.IsNullOrWhiteSpace(request.DescriptionAr) ? request.DescriptionAr.Trim() : null;
        var descEn = !string.IsNullOrWhiteSpace(request.DescriptionEn)
            ? request.DescriptionEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Description) ? request.Description.Trim() : null);

        var trimmedName = nameEn;
        var exists = await dbContext.WorkSchedules
            .AnyAsync(s => (s.Name == trimmedName) ||
                           (nameAr != null && s.NameAr != null && s.NameAr == nameAr),
                      cancellationToken);

        if (exists)
        {
            return GenericBaseResponse<WorkScheduleDto>.Fail(
                "A work schedule with this name already exists.",
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

        // If IsDefault, clear existing default
        if (request.IsDefault)
        {
            var existingDefaults = await dbContext.WorkSchedules
                .Where(s => s.IsDefault)
                .ToListAsync(cancellationToken);

            foreach (var d in existingDefaults)
            {
                d.IsDefault = false;
            }
        }

        var schedule = new WorkSchedule
        {
            Name = trimmedName,
            NameAr = nameAr,
            Description = descEn,
            DescriptionAr = descAr,
            IsActive = request.IsActive,
            IsDefault = request.IsDefault,
            Created_Utc = DateTime.UtcNow,
            Created_By = currentUser.UserId
        };

        // Populate 7 days of the week
        var inputDays = request.Days?.ToDictionary(d => d.DayOfWeek) ?? [];
        for (int i = 0; i < 7; i++)
        {
            var dow = (DayOfWeek)i;
            if (inputDays.TryGetValue(dow, out var inputDay))
            {
                schedule.Days.Add(new WorkScheduleDay
                {
                    WorkScheduleId = schedule.Id,
                    DayOfWeek = dow,
                    IsWorkingDay = inputDay.IsWorkingDay,
                    WorkShiftId = inputDay.IsWorkingDay ? inputDay.WorkShiftId : null
                });
            }
            else
            {
                // Default Friday/Saturday off, Sunday-Thursday working
                bool isWorkDay = dow != DayOfWeek.Friday && dow != DayOfWeek.Saturday;
                schedule.Days.Add(new WorkScheduleDay
                {
                    WorkScheduleId = schedule.Id,
                    DayOfWeek = dow,
                    IsWorkingDay = isWorkDay,
                    WorkShiftId = isWorkDay && shiftIds.Count > 0 ? shiftIds[0] : null
                });
            }
        }

        dbContext.WorkSchedules.Add(schedule);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Fetch back with shifts for DTO mapping
        var savedDays = await dbContext.WorkScheduleDays
            .Include(d => d.Shift)
            .Where(d => d.WorkScheduleId == schedule.Id)
            .OrderBy(d => d.DayOfWeek)
            .ToListAsync(cancellationToken);

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
            0,
            schedule.Created_Utc,
            schedule.Created_By,
            schedule.Updated_Utc,
            schedule.Updated_By,
            schedule.NameAr,
            schedule.DescriptionAr
        );

        return GenericBaseResponse<WorkScheduleDto>.Success(dto, "Work schedule created successfully.", HttpStatusCode.Created);
    }
}
