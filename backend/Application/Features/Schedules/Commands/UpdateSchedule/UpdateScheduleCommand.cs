using Application.Features.Schedules.Commands.CreateSchedule;
using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Commands.UpdateSchedule;

public sealed record UpdateScheduleCommand(
    Guid Id = default,
    string Name = "",
    string? Description = null,
    bool IsActive = true,
    bool IsDefault = false,
    IReadOnlyList<ScheduleDayInput>? Days = null
) : IRequest<GenericBaseResponse<WorkScheduleDto>>;
