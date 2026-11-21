using Application.Common;
using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Queries.GetShifts;

public sealed record GetShiftsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    bool? IsActive = null,
    string? SortBy = null,
    bool? SortDescending = null
) : IRequest<GenericBaseResponse<PaginationResult<WorkShiftDto>>>;
