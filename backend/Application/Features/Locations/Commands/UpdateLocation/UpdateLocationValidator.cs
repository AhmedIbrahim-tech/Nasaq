namespace Application.Features.Locations.Commands.UpdateLocation;

public sealed class UpdateLocationValidator : AbstractValidator<UpdateLocationCommand>
{
    public UpdateLocationValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Location ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Location name is required.")
            .MaximumLength(150).WithMessage("Location name cannot exceed 150 characters.");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90.0, 90.0)
            .WithMessage("Latitude must be between -90 and 90 degrees.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180.0, 180.0)
            .WithMessage("Longitude must be between -180 and 180 degrees.");

        RuleFor(x => x.RadiusMeters)
            .GreaterThan(0)
            .WithMessage("Geofence radius must be greater than zero meters.")
            .LessThanOrEqualTo(5000)
            .WithMessage("Geofence radius cannot exceed 5000 meters.");

        RuleFor(x => x.AccuracyThresholdMeters)
            .GreaterThan(0)
            .WithMessage("GPS accuracy threshold must be greater than zero meters.")
            .LessThanOrEqualTo(500)
            .WithMessage("GPS accuracy threshold cannot exceed 500 meters.");
    }
}
