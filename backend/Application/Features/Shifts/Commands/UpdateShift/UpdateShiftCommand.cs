using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Commands.UpdateShift;

public sealed record UpdateShiftCommand(
    Guid Id = default,
    string Name = "",
    string? NameAr = null,
    string? NameEn = null,
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
