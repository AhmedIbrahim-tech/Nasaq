using FluentValidation;

namespace Application.Features.Leaves.Commands.UpdateLeaveType;

public class UpdateLeaveTypeValidator : AbstractValidator<UpdateLeaveTypeCommand>
{
    public UpdateLeaveTypeValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Leave type ID is required.");

        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Name) || !string.IsNullOrWhiteSpace(x.NameEn) || !string.IsNullOrWhiteSpace(x.NameAr))
            .WithMessage("Leave type name is required in at least one language.");

        When(x => !string.IsNullOrWhiteSpace(x.Name), () =>
        {
            RuleFor(x => x.Name).MaximumLength(150).WithMessage("Leave type name cannot exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NameEn), () =>
        {
            RuleFor(x => x.NameEn!).MaximumLength(150).WithMessage("English leave type name cannot exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NameAr), () =>
        {
            RuleFor(x => x.NameAr!).MaximumLength(150).WithMessage("Arabic leave type name cannot exceed 150 characters.");
        });

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.DescriptionEn)
            .MaximumLength(500).WithMessage("English description cannot exceed 500 characters.");

        RuleFor(x => x.DescriptionAr)
            .MaximumLength(500).WithMessage("Arabic description cannot exceed 500 characters.");

        RuleFor(x => x.DefaultDaysPerYear)
            .GreaterThan(0).When(x => x.DefaultDaysPerYear.HasValue)
            .WithMessage("Default days per year must be greater than zero.");
    }
}
