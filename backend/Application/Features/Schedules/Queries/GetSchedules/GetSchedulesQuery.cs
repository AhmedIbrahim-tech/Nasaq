using Application.Common;
using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Queries.GetSchedules;

public sealed record GetSchedulesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    bool? IsActive = null,
    string? SortBy = null,
    bool? SortDescending = null
) : IRequest<GenericBaseResponse<PaginationResult<WorkScheduleDto>>>;
