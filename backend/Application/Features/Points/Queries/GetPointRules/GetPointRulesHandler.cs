using Application.Abstractions;
using Application.Common;
using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Queries.GetPointRules;

public class GetPointRulesHandler : IRequestHandler<GetPointRulesQuery, GenericBaseResponse<PaginationResult<PointRuleDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetPointRulesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<PaginationResult<PointRuleDto>>> Handle(
        GetPointRulesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.PointRules.AsNoTracking();

        if (request.Category.HasValue)
        {
            query = query.Where(r => r.Category == request.Category.Value);
        }

        if (request.EventType.HasValue)
        {
            query = query.Where(r => r.EventType == request.EventType.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(r => r.IsActive == request.IsActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(r => r.Created_Utc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(PointRuleDto.FromEntity).ToList();
        var result = PaginationResult<PointRuleDto>.Success(dtos, totalCount, page, pageSize);

        return GenericBaseResponse<PaginationResult<PointRuleDto>>.Success(result);
    }
}
