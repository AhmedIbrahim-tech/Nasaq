using FluentValidation;

namespace Application.Features.AdminOperations.Commands.RejectGpsException;

public class RejectGpsExceptionValidator : AbstractValidator<RejectGpsExceptionCommand>
{
    public RejectGpsExceptionValidator()
    {
        RuleFor(x => x.AttendanceRecordId)
            .NotEmpty().WithMessage("Attendance record ID is required.");

        RuleFor(x => x.EventType)
            .NotEmpty()
            .Must(e => e.Equals("CheckIn", StringComparison.OrdinalIgnoreCase) ||
                       e.Equals("CheckOut", StringComparison.OrdinalIgnoreCase))
            .WithMessage("EventType must be either 'CheckIn' or 'CheckOut'.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Rejection reason is mandatory.")
            .MinimumLength(3).WithMessage("Rejection reason must be at least 3 characters.");
    }
}
