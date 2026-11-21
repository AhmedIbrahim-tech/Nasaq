using Application.Common;
using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Points.Queries.GetPointRules;

public sealed record GetPointRulesQuery(
    PointCategory? Category = null,
    PointEventType? EventType = null,
    bool? IsActive = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<GenericBaseResponse<PaginationResult<PointRuleDto>>>;
