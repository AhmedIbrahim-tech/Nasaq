using FluentValidation;

namespace Application.Features.AdminOperations.Commands.ApproveGpsException;

public class ApproveGpsExceptionValidator : AbstractValidator<ApproveGpsExceptionCommand>
{
    public ApproveGpsExceptionValidator()
    {
        RuleFor(x => x.AttendanceRecordId)
            .NotEmpty().WithMessage("Attendance record ID is required.");

        RuleFor(x => x.EventType)
            .NotEmpty()
            .Must(e => e.Equals("CheckIn", StringComparison.OrdinalIgnoreCase) ||
                       e.Equals("CheckOut", StringComparison.OrdinalIgnoreCase))
            .WithMessage("EventType must be either 'CheckIn' or 'CheckOut'.");
    }
}
