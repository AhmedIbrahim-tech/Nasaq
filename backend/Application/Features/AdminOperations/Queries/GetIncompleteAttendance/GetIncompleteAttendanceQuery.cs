using Application.Common;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.AdminOperations.Queries.GetIncompleteAttendance;

public sealed record GetIncompleteAttendanceQuery(
    Guid? EmployeeId = null,
    Guid? WorkLocationId = null,
    DateOnly? Date = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<GenericBaseResponse<PaginationResult<AttendanceRecordDto>>>;
