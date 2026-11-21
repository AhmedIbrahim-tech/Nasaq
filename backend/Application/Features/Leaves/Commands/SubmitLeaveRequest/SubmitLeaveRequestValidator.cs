using FluentValidation;

namespace Application.Features.Leaves.Commands.SubmitLeaveRequest;

public class SubmitLeaveRequestValidator : AbstractValidator<SubmitLeaveRequestCommand>
{
    public SubmitLeaveRequestValidator()
    {
        RuleFor(x => x.LeaveTypeId)
            .NotEmpty().WithMessage("Leave type is required.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("End date cannot be earlier than start date.");

        RuleFor(x => x.Reason)
            .MaximumLength(1000).WithMessage("Reason cannot exceed 1000 characters.");
    }
}
