using Application.Common;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.AdminOperations.Queries.GetGpsExceptions;

public sealed record GetGpsExceptionsQuery(
    Guid? EmployeeId = null,
    Guid? WorkLocationId = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<GenericBaseResponse<PaginationResult<AttendanceRecordDto>>>;
