using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Queries.GetLeaveSummary;

public record GetLeaveSummaryQuery : IRequest<GenericBaseResponse<LeaveSummaryDto>>;
