using FluentValidation;

namespace Application.Features.AdminOperations.Commands.CorrectIncompleteAttendance;

public class CorrectIncompleteAttendanceValidator : AbstractValidator<CorrectIncompleteAttendanceCommand>
{
    public CorrectIncompleteAttendanceValidator()
    {
        RuleFor(x => x.AttendanceRecordId)
            .NotEmpty().WithMessage("Attendance record ID is required.");

        RuleFor(x => x.ManualCheckOutTimeUtc)
            .NotEmpty().WithMessage("Manual Check-out timestamp is required.")
            .LessThanOrEqualTo(DateTime.UtcNow.AddMinutes(5)).WithMessage("Check-out time cannot be in the future.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Correction reason is mandatory.")
            .MinimumLength(3).WithMessage("Correction reason must be at least 3 characters.");
    }
}
