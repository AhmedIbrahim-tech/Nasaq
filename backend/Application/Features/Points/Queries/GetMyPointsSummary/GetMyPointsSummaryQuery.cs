using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Points.Queries.GetMyPointsSummary;

public sealed record GetMyPointsSummaryQuery : IRequest<GenericBaseResponse<EmployeePointsSummaryDto>>;
