using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Attendance.Queries.GetCurrentAttendanceStatus;

public class GetCurrentAttendanceStatusQuery : IRequest<GenericBaseResponse<CurrentAttendanceStatusDto>>
{
}
