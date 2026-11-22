using Application.Abstractions;
using FluentValidation;

namespace Application.Features.EmployeeLocations.Commands.RegisterEmployeeLocation;

public class RegisterEmployeeLocationValidator : AbstractValidator<RegisterEmployeeLocationCommand>
{
    public RegisterEmployeeLocationValidator(IGeofenceService geofenceService)
    {
        RuleFor(x => x)
            .Must(x => geofenceService.IsValidCoordinate(x.Latitude, x.Longitude))
            .WithMessage("Invalid geographic coordinates provided.");
    }
}
