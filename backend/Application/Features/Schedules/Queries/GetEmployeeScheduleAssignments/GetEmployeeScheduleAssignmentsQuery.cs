using Application.Common;
using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Queries.GetEmployeeScheduleAssignments;

public sealed record GetEmployeeScheduleAssignmentsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    Guid? WorkScheduleId = null,
    Guid? EmployeeId = null,
    bool? IsActive = null
) : IRequest<GenericBaseResponse<PaginationResult<EmployeeScheduleAssignmentDto>>>;
