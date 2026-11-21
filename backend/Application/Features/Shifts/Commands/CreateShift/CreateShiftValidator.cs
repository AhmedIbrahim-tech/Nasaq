namespace Application.Features.Shifts.Commands.CreateShift;

public sealed class CreateShiftValidator : AbstractValidator<CreateShiftCommand>
{
    public CreateShiftValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Shift name is required.")
            .MaximumLength(150).WithMessage("Shift name must not exceed 150 characters.");

        RuleFor(x => x)
            .Must(x => x.StartTime != x.EndTime)
            .WithMessage("Shift start time and end time cannot be identical.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Notes));
    }
}
