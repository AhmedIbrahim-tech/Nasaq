using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Queries.GetShiftsSummary;

public sealed record GetShiftsSummaryQuery : IRequest<GenericBaseResponse<ShiftsSummaryDto>>;
