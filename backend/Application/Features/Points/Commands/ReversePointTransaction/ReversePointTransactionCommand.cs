using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Points.Commands.ReversePointTransaction;

public sealed record ReversePointTransactionCommand(
    Guid TransactionId,
    string Reason
) : IRequest<GenericBaseResponse<PointTransactionDto>>;
