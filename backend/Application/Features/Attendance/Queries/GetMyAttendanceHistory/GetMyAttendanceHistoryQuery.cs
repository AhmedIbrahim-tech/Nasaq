using Application.Common;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Attendance.Queries.GetMyAttendanceHistory;

public class GetMyAttendanceHistoryQuery : IRequest<GenericBaseResponse<PaginationResult<AttendanceRecordDto>>>
{
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
