using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Points.Commands.TogglePointRuleStatus;

public sealed record TogglePointRuleStatusCommand(Guid Id) : IRequest<GenericBaseResponse<PointRuleDto>>;
