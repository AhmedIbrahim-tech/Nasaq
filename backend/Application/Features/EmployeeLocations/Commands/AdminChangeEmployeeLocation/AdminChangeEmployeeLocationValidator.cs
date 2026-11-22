using Application.Abstractions;
using FluentValidation;

namespace Application.Features.EmployeeLocations.Commands.AdminChangeEmployeeLocation;

public class AdminChangeEmployeeLocationValidator : AbstractValidator<AdminChangeEmployeeLocationCommand>
{
    public AdminChangeEmployeeLocationValidator(IGeofenceService geofenceService)
    {
        RuleFor(x => x)
            .Must(x => geofenceService.IsValidCoordinate(x.Latitude, x.Longitude))
            .WithMessage("Invalid coordinates provided.");
    }
}
