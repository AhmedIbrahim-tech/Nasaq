using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Points.Commands.UpdatePointRule;

public sealed record UpdatePointRuleCommand(
    Guid Id,
    string Name,
    string? Description,
    PointCategory Category,
    PointEventType EventType,
    int Points,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo = null,
    string? NameAr = null,
    string? NameEn = null,
    string? DescriptionAr = null,
    string? DescriptionEn = null
) : IRequest<GenericBaseResponse<PointRuleDto>>;
