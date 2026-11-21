using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Points.Commands.CreatePointRule;

public sealed record CreatePointRuleCommand(
    string Name,
    string? Description,
    PointCategory Category,
    PointEventType EventType,
    int Points,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo = null
) : IRequest<GenericBaseResponse<PointRuleDto>>;
