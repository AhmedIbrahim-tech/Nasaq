using FluentValidation;

namespace Application.Features.Points.Commands.UpdatePointRule;

public class UpdatePointRuleValidator : AbstractValidator<UpdatePointRuleCommand>
{
    public UpdatePointRuleValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Rule ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Rule name is required.")
            .MaximumLength(150).WithMessage("Rule name cannot exceed 150 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Valid point category is required.");

        RuleFor(x => x.EventType)
            .IsInEnum().WithMessage("Valid event type is required.");

        RuleFor(x => x)
            .Must(x => x.EffectiveTo == null || x.EffectiveTo >= x.EffectiveFrom)
            .WithMessage("Effective To date must be on or after Effective From date.");
    }
}
