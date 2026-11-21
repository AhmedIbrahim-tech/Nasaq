using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Queries.GetShiftById;

public sealed record GetShiftByIdQuery(Guid Id) : IRequest<GenericBaseResponse<WorkShiftDto>>;
