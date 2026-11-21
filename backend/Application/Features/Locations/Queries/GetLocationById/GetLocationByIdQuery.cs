namespace Application.Features.Locations.Queries.GetLocationById;

public sealed record GetLocationByIdQuery(Guid Id) : IRequest<GenericBaseResponse<WorkLocationDto>>;
