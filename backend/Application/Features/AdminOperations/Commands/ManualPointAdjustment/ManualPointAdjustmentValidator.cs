using FluentValidation;

namespace Application.Features.AdminOperations.Commands.ManualPointAdjustment;

public class ManualPointAdjustmentValidator : AbstractValidator<ManualPointAdjustmentCommand>
{
    public ManualPointAdjustmentValidator()
    {
        RuleFor(x => x.EmployeeId)
            .NotEmpty().WithMessage("Employee ID is required.");

        RuleFor(x => x.Points)
            .NotEqual(0).WithMessage("Points adjustment cannot be zero.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Written adjustment reason is mandatory.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.");

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid point category.");
    }
}
