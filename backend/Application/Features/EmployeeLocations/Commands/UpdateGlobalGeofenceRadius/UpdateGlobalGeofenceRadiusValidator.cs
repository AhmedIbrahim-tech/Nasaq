using FluentValidation;

namespace Application.Features.EmployeeLocations.Commands.UpdateGlobalGeofenceRadius;

public class UpdateGlobalGeofenceRadiusValidator : AbstractValidator<UpdateGlobalGeofenceRadiusCommand>
{
    public UpdateGlobalGeofenceRadiusValidator()
    {
        RuleFor(x => x.RadiusMeters)
            .InclusiveBetween(10.0, 1000.0)
            .WithMessage("Global geofence radius must be between 10 and 1000 meters.");
    }
}
