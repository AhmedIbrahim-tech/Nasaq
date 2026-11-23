namespace Application.Features.Locations.Commands.UpdateLocation;

public sealed class UpdateLocationValidator : AbstractValidator<UpdateLocationCommand>
{
    public UpdateLocationValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Location ID is required.");

        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Name) || !string.IsNullOrWhiteSpace(x.NameEn) || !string.IsNullOrWhiteSpace(x.NameAr))
            .WithMessage("Location name is required in at least one language.");

        When(x => !string.IsNullOrWhiteSpace(x.Name), () =>
        {
            RuleFor(x => x.Name).MaximumLength(150).WithMessage("Location name cannot exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NameEn), () =>
        {
            RuleFor(x => x.NameEn!).MaximumLength(150).WithMessage("English location name cannot exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NameAr), () =>
        {
            RuleFor(x => x.NameAr!).MaximumLength(150).WithMessage("Arabic location name cannot exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Address), () =>
        {
            RuleFor(x => x.Address!).MaximumLength(250).WithMessage("Address cannot exceed 250 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.AddressEn), () =>
        {
            RuleFor(x => x.AddressEn!).MaximumLength(250).WithMessage("English address cannot exceed 250 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.AddressAr), () =>
        {
            RuleFor(x => x.AddressAr!).MaximumLength(250).WithMessage("Arabic address cannot exceed 250 characters.");
        });

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
