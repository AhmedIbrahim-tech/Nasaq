using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Points.Commands.EvaluateAttendanceRecord;

public sealed record EvaluateAttendanceRecordCommand(Guid AttendanceRecordId)
    : IRequest<GenericBaseResponse<List<PointTransactionDto>>>;
