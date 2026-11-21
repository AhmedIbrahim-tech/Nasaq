namespace Application.Features.Locations.Commands.DeleteLocation;

public sealed record DeleteLocationCommand(Guid Id) : IRequest<GenericBaseResponse<object?>>;
