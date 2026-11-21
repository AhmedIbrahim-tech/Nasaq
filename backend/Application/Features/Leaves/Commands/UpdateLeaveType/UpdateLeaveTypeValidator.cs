using FluentValidation;

namespace Application.Features.Leaves.Commands.UpdateLeaveType;

public class UpdateLeaveTypeValidator : AbstractValidator<UpdateLeaveTypeCommand>
{
    public UpdateLeaveTypeValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Leave type ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Leave type name is required.")
            .MaximumLength(150).WithMessage("Leave type name cannot exceed 150 characters.");

        RuleFor(x => x.NameAr)
            .NotEmpty().WithMessage("Arabic leave type name is required.")
            .MaximumLength(150).WithMessage("Arabic leave type name cannot exceed 150 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.DefaultDaysPerYear)
            .GreaterThan(0).When(x => x.DefaultDaysPerYear.HasValue)
            .WithMessage("Default days per year must be greater than zero.");
    }
}
