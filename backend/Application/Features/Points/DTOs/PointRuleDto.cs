using Domain.Entities;
using Domain.Enums;

namespace Application.Features.Points.DTOs;

public sealed record PointRuleDto(
    Guid Id,
    string Name,
    string? Description,
    PointCategory Category,
    PointEventType EventType,
    int Points,
    bool IsActive,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    int Version,
    DateTime Created_Utc,
    string? Created_By,
    string? NameAr = null,
    string? DescriptionAr = null
)
{
    public static PointRuleDto FromEntity(PointRule r) => new(
        r.Id,
        r.Name,
        r.Description,
        r.Category,
        r.EventType,
        r.Points,
        r.IsActive,
        r.EffectiveFrom,
        r.EffectiveTo,
        r.Version,
        r.Created_Utc,
        r.Created_By,
        r.NameAr,
        r.DescriptionAr
    );
}
