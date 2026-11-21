using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Commands.CreateShift;

public sealed record CreateShiftCommand(
    string Name = "",
    string? NameAr = null,
    TimeOnly StartTime = default,
    TimeOnly EndTime = default,
    bool IsOvernight = false,
    TimeOnly? EarlyStartTime = null,
    TimeOnly? OnTimeStartTime = null,
    TimeOnly? LateStartTime = null,
    TimeOnly? CutoffTime = null,
    string? Notes = null,
    bool IsActive = true
) : IRequest<GenericBaseResponse<WorkShiftDto>>;
