using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Commands.AssignEmployeeSchedule;

public sealed record AssignEmployeeScheduleCommand(
    Guid EmployeeId,
    Guid WorkScheduleId,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo = null,
    string? Notes = null
) : IRequest<GenericBaseResponse<EmployeeScheduleAssignmentDto>>;
