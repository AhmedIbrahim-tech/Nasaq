using FluentValidation;

namespace Application.Features.Attendance.Commands.CheckIn;

public class CheckInValidator : AbstractValidator<CheckInCommand>
{
    public CheckInValidator()
    {
        When(x => x.Latitude.HasValue, () =>
        {
            RuleFor(x => x.Latitude!.Value)
                .InclusiveBetween(-90.0, 90.0)
                .WithMessage("Latitude must be between -90 and 90 degrees.");
        });

        When(x => x.Longitude.HasValue, () =>
        {
            RuleFor(x => x.Longitude!.Value)
                .InclusiveBetween(-180.0, 180.0)
                .WithMessage("Longitude must be between -180 and 180 degrees.");
        });

        When(x => x.AccuracyMeters.HasValue, () =>
        {
            RuleFor(x => x.AccuracyMeters!.Value)
                .GreaterThan(0.0)
                .WithMessage("GPS Accuracy must be greater than 0 meters.");
        });

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notes cannot exceed 500 characters.");

        RuleFor(x => x.DeviceInfo)
            .MaximumLength(200)
            .WithMessage("Device info cannot exceed 200 characters.");
    }
}
