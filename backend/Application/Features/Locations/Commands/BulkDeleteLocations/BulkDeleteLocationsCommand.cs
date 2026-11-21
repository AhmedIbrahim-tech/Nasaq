namespace Application.Features.Locations.Commands.BulkDeleteLocations;

public sealed record BulkDeleteLocationsCommand(List<Guid> Ids) : IRequest<GenericBaseResponse<int>>;
