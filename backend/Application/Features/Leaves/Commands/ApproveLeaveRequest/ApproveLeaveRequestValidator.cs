using FluentValidation;

namespace Application.Features.Leaves.Commands.ApproveLeaveRequest;

public class ApproveLeaveRequestValidator : AbstractValidator<ApproveLeaveRequestCommand>
{
    public ApproveLeaveRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Leave request ID is required.");

        RuleFor(x => x.ReviewNotes)
            .MaximumLength(1000).WithMessage("Review notes cannot exceed 1000 characters.");
    }
}
