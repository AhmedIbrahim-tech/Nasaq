using Application.Abstractions;
using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Commands.UpdatePointRule;

public class UpdatePointRuleHandler : IRequestHandler<UpdatePointRuleCommand, GenericBaseResponse<PointRuleDto>>
{
    private readonly IApplicationDbContext _context;

    public UpdatePointRuleHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<PointRuleDto>> Handle(
        UpdatePointRuleCommand request,
        CancellationToken cancellationToken)
    {
        var rule = await _context.PointRules
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (rule == null)
        {
            return GenericBaseResponse<PointRuleDto>.NotFound($"Point rule with ID '{request.Id}' was not found.");
        }

        var nameEn = !string.IsNullOrWhiteSpace(request.NameEn) ? request.NameEn.Trim() : (!string.IsNullOrWhiteSpace(request.Name) ? request.Name.Trim() : null);
        var nameAr = !string.IsNullOrWhiteSpace(request.NameAr) ? request.NameAr.Trim() : null;
        var primaryName = !string.IsNullOrWhiteSpace(nameEn) ? nameEn : (nameAr ?? request.Name?.Trim() ?? string.Empty);

        var descEn = !string.IsNullOrWhiteSpace(request.DescriptionEn) ? request.DescriptionEn.Trim() : request.Description?.Trim();
        var descAr = !string.IsNullOrWhiteSpace(request.DescriptionAr) ? request.DescriptionAr.Trim() : null;

        var nameExists = await _context.PointRules
            .AnyAsync(r => r.Id != request.Id &&
                           (r.Name.ToLower() == primaryName.ToLower() ||
                            (!string.IsNullOrEmpty(nameAr) && r.NameAr != null && r.NameAr.ToLower() == nameAr.ToLower())),
                      cancellationToken);

        if (nameExists)
        {
            return GenericBaseResponse<PointRuleDto>.Conflict($"Another point rule named '{primaryName}' already exists.");
        }

        var points = request.Points;
        if (request.Category == PointCategory.Green && points < 0)
        {
            points = Math.Abs(points);
        }
        else if ((request.Category == PointCategory.Red || request.Category == PointCategory.Black) && points > 0)
        {
            points = -points;
        }

        rule.Name = primaryName;
        rule.NameAr = nameAr;
        rule.Description = descEn;
        rule.DescriptionAr = descAr;
        rule.Category = request.Category;
        rule.EventType = request.EventType;
        rule.Points = points;
        rule.EffectiveFrom = request.EffectiveFrom;
        rule.EffectiveTo = request.EffectiveTo;
        rule.Version += 1;

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<PointRuleDto>.Success(PointRuleDto.FromEntity(rule), "Point rule updated successfully.");
    }
}
