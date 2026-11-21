using Application.Abstractions;
using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Commands.CreatePointRule;

public class CreatePointRuleHandler : IRequestHandler<CreatePointRuleCommand, GenericBaseResponse<PointRuleDto>>
{
    private readonly IApplicationDbContext _context;

    public CreatePointRuleHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<PointRuleDto>> Handle(
        CreatePointRuleCommand request,
        CancellationToken cancellationToken)
    {
        var normalizedName = request.Name.Trim();

        var existing = await _context.PointRules
            .AnyAsync(r => r.Name.ToLower() == normalizedName.ToLower(), cancellationToken);

        if (existing)
        {
            return GenericBaseResponse<PointRuleDto>.Conflict($"A point rule named '{normalizedName}' already exists.");
        }

        // Enforce signed point convention: Green is positive, Red/Black is negative
        var points = request.Points;
        if (request.Category == PointCategory.Green && points < 0)
        {
            points = Math.Abs(points);
        }
        else if ((request.Category == PointCategory.Red || request.Category == PointCategory.Black) && points > 0)
        {
            points = -points;
        }

        var rule = new PointRule
        {
            Name = normalizedName,
            Description = request.Description?.Trim(),
            Category = request.Category,
            EventType = request.EventType,
            Points = points,
            IsActive = true,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            Version = 1
        };

        _context.PointRules.Add(rule);
        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<PointRuleDto>.Created(PointRuleDto.FromEntity(rule), "Point rule created successfully.");
    }
}
