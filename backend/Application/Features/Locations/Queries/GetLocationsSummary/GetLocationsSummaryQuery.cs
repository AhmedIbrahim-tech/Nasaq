namespace Application.Features.Locations.Queries.GetLocationsSummary;

public sealed record GetLocationsSummaryQuery : IRequest<GenericBaseResponse<LocationsSummaryDto>>;
