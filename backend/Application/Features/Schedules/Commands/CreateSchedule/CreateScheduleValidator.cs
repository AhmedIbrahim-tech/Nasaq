namespace Application.Features.Schedules.Commands.CreateSchedule;

public sealed class CreateScheduleValidator : AbstractValidator<CreateScheduleCommand>
{
    public CreateScheduleValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Schedule name is required.")
            .MaximumLength(150).WithMessage("Schedule name must not exceed 150 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleForEach(x => x.Days)
            .Must(day => !day.IsWorkingDay || (day.WorkShiftId.HasValue && day.WorkShiftId != Guid.Empty))
            .WithMessage("A working day must have an assigned work shift.");
    }
}
