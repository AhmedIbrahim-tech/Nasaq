namespace Application.Features.Locations.Commands.ToggleLocationStatus;

public sealed record ToggleLocationStatusCommand(
    Guid Id = default,
    bool? IsActive = null
) : IRequest<GenericBaseResponse<WorkLocationDto>>;
