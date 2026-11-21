using Application.Common;
using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Points.Queries.GetMyPointTransactions;

public sealed record GetMyPointTransactionsQuery(
    PointCategory? Category = null,
    PointTransactionStatus? Status = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<GenericBaseResponse<PaginationResult<PointTransactionDto>>>;
