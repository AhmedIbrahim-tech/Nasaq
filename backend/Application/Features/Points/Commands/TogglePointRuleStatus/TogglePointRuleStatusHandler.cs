using Application.Abstractions;
using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Commands.TogglePointRuleStatus;

public class TogglePointRuleStatusHandler : IRequestHandler<TogglePointRuleStatusCommand, GenericBaseResponse<PointRuleDto>>
{
    private readonly IApplicationDbContext _context;

    public TogglePointRuleStatusHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<PointRuleDto>> Handle(
        TogglePointRuleStatusCommand request,
        CancellationToken cancellationToken)
    {
        var rule = await _context.PointRules
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (rule == null)
        {
            return GenericBaseResponse<PointRuleDto>.NotFound($"Point rule with ID '{request.Id}' was not found.");
        }

        rule.IsActive = !rule.IsActive;
        await _context.SaveChangesAsync(cancellationToken);

        var message = rule.IsActive ? "Point rule activated successfully." : "Point rule deactivated successfully.";
        return GenericBaseResponse<PointRuleDto>.Success(PointRuleDto.FromEntity(rule), message);
    }
}
