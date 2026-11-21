namespace Application.Features.Locations.Commands.CreateLocation;

public sealed record CreateLocationCommand(
    string Name = "",
    string? NameAr = null,
    string? Address = null,
    string? AddressAr = null,
    double Latitude = 0,
    double Longitude = 0,
    double RadiusMeters = 150.0,
    double AccuracyThresholdMeters = 50.0,
    bool IsActive = true
) : IRequest<GenericBaseResponse<WorkLocationDto>>;
