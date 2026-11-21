using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.AdminOperations.Commands.ApproveGpsException;

public sealed record ApproveGpsExceptionCommand(
    Guid AttendanceRecordId,
    string EventType = "CheckIn",
    string? Notes = null
) : IRequest<GenericBaseResponse<AttendanceRecordDto>>;
