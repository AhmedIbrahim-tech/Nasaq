using FluentValidation;

namespace Application.Features.EmployeeLocations.Commands.RejectEmployeeLocation;

public class RejectEmployeeLocationValidator : AbstractValidator<RejectEmployeeLocationCommand>
{
    public RejectEmployeeLocationValidator()
    {
        RuleFor(x => x.RejectionReason)
            .NotEmpty()
            .WithMessage("Rejection reason is mandatory.")
            .MaximumLength(1000)
            .WithMessage("Rejection reason cannot exceed 1000 characters.");
    }
}
