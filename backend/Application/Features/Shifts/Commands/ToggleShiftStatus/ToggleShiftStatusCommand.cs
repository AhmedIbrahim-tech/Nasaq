using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Commands.ToggleShiftStatus;

public sealed record ToggleShiftStatusCommand(
    Guid Id,
    bool? IsActive = null
) : IRequest<GenericBaseResponse<WorkShiftDto>>;
