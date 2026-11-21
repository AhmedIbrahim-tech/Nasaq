using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.AdminOperations.Commands.ManualPointAdjustment;

public sealed record ManualPointAdjustmentCommand(
    Guid EmployeeId,
    PointCategory Category,
    int Points,
    string Reason
) : IRequest<GenericBaseResponse<PointTransactionDto>>;
