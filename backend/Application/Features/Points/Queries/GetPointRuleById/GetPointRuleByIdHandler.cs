using Application.Abstractions;
using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Queries.GetPointRuleById;

public class GetPointRuleByIdHandler : IRequestHandler<GetPointRuleByIdQuery, GenericBaseResponse<PointRuleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPointRuleByIdHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<PointRuleDto>> Handle(
        GetPointRuleByIdQuery request,
        CancellationToken cancellationToken)
    {
        var rule = await _context.PointRules
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (rule == null)
        {
            return GenericBaseResponse<PointRuleDto>.NotFound($"Point rule with ID '{request.Id}' was not found.");
        }

        return GenericBaseResponse<PointRuleDto>.Success(PointRuleDto.FromEntity(rule));
    }
}
