namespace Application.Features.Locations.Queries.GetLocations;

public sealed record GetLocationsQuery(
    string? Search = null,
    bool? IsActive = null
) : IRequest<GenericBaseResponse<IReadOnlyList<WorkLocationDto>>>;
