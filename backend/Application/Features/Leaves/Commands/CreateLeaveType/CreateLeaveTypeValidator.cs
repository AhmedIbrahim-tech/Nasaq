using FluentValidation;

namespace Application.Features.Leaves.Commands.CreateLeaveType;

public class CreateLeaveTypeValidator : AbstractValidator<CreateLeaveTypeCommand>
{
    public CreateLeaveTypeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Leave type name is required.")
            .MaximumLength(150).WithMessage("Leave type name cannot exceed 150 characters.");

        RuleFor(x => x.NameAr)
            .NotEmpty().WithMessage("Arabic leave type name is required.")
            .MaximumLength(150).WithMessage("Arabic leave type name cannot exceed 150 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Leave type code is required.")
            .MaximumLength(50).WithMessage("Leave type code cannot exceed 50 characters.")
            .Matches("^[A-Za-z0-9_-]+$").WithMessage("Code can only contain alphanumeric characters, hyphens and underscores.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.DefaultDaysPerYear)
            .GreaterThan(0).When(x => x.DefaultDaysPerYear.HasValue)
            .WithMessage("Default days per year must be greater than zero.");
    }
}
