using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Commands.CreateSchedule;

public sealed record ScheduleDayInput(
    DayOfWeek DayOfWeek,
    bool IsWorkingDay,
    Guid? WorkShiftId
);

public sealed record CreateScheduleCommand(
    string Name = "",
    string? NameAr = null,
    string? NameEn = null,
    string? Description = null,
    string? DescriptionAr = null,
    string? DescriptionEn = null,
    bool IsActive = true,
    bool IsDefault = false,
    IReadOnlyList<ScheduleDayInput>? Days = null
) : IRequest<GenericBaseResponse<WorkScheduleDto>>;
