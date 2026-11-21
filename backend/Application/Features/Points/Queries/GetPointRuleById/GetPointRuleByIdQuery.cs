using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Points.Queries.GetPointRuleById;

public sealed record GetPointRuleByIdQuery(Guid Id) : IRequest<GenericBaseResponse<PointRuleDto>>;
