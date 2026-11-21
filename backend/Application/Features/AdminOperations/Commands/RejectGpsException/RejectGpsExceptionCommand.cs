using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.AdminOperations.Commands.RejectGpsException;

public sealed record RejectGpsExceptionCommand(
    Guid AttendanceRecordId,
    string EventType,
    string Reason
) : IRequest<GenericBaseResponse<AttendanceRecordDto>>;
