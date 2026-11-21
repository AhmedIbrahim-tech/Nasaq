using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Commands.ToggleScheduleStatus;

public sealed record ToggleScheduleStatusCommand(
    Guid Id,
    bool? IsActive = null
) : IRequest<GenericBaseResponse<WorkScheduleDto>>;
