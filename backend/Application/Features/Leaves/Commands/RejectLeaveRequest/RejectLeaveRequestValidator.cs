using FluentValidation;

namespace Application.Features.Leaves.Commands.RejectLeaveRequest;

public class RejectLeaveRequestValidator : AbstractValidator<RejectLeaveRequestCommand>
{
    public RejectLeaveRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Leave request ID is required.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Rejection reason is mandatory.")
            .MaximumLength(1000).WithMessage("Rejection reason cannot exceed 1000 characters.");
    }
}
