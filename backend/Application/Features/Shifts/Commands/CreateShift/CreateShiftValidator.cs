namespace Application.Features.Shifts.Commands.CreateShift;

public sealed class CreateShiftValidator : AbstractValidator<CreateShiftCommand>
{
    public CreateShiftValidator()
    {
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Name) || !string.IsNullOrWhiteSpace(x.NameEn) || !string.IsNullOrWhiteSpace(x.NameAr))
            .WithMessage("Shift name is required in at least one language.");

        When(x => !string.IsNullOrWhiteSpace(x.Name), () =>
        {
            RuleFor(x => x.Name).MaximumLength(150).WithMessage("Shift name must not exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NameEn), () =>
        {
            RuleFor(x => x.NameEn!).MaximumLength(150).WithMessage("English shift name must not exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NameAr), () =>
        {
            RuleFor(x => x.NameAr!).MaximumLength(150).WithMessage("Arabic shift name must not exceed 150 characters.");
        });

        RuleFor(x => x)
            .Must(x => x.StartTime != x.EndTime)
            .WithMessage("Shift start time and end time cannot be identical.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Notes));
    }
}
