using Application.Common;
using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Points.Queries.GetPointTransactions;

public sealed record GetPointTransactionsQuery(
    Guid? EmployeeId = null,
    PointCategory? Category = null,
    PointEventType? EventType = null,
    PointTransactionStatus? Status = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<GenericBaseResponse<PaginationResult<PointTransactionDto>>>;
