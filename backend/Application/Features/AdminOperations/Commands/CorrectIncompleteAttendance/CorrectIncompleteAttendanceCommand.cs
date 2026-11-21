using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.AdminOperations.Commands.CorrectIncompleteAttendance;

public sealed record CorrectIncompleteAttendanceCommand(
    Guid AttendanceRecordId,
    DateTime ManualCheckOutTimeUtc,
    string Reason
) : IRequest<GenericBaseResponse<AttendanceRecordDto>>;
