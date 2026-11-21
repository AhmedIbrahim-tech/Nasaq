using Application.Common;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Attendance.Queries.GetAttendanceRecords;

public sealed record GetAttendanceRecordsQuery(
    Guid? EmployeeId = null,
    Guid? WorkLocationId = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    AttendanceStatus? Status = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<GenericBaseResponse<PaginationResult<AttendanceRecordDto>>>;
