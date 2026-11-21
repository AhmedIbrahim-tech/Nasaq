using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Attendance.Queries.GetAttendanceRecordById;

public sealed record GetAttendanceRecordByIdQuery(Guid Id) : IRequest<GenericBaseResponse<AttendanceRecordDto>>;
