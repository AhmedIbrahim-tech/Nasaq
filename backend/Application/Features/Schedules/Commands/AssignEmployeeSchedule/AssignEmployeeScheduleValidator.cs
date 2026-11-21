namespace Application.Features.Schedules.Commands.AssignEmployeeSchedule;

public sealed class AssignEmployeeScheduleValidator : AbstractValidator<AssignEmployeeScheduleCommand>
{
    public AssignEmployeeScheduleValidator()
    {
        RuleFor(x => x.EmployeeId)
            .NotEmpty().WithMessage("Employee ID is required.");

        RuleFor(x => x.WorkScheduleId)
            .NotEmpty().WithMessage("Work Schedule ID is required.");

        RuleFor(x => x.EffectiveFrom)
            .NotEmpty().WithMessage("Effective From date is required.");

        RuleFor(x => x)
            .Must(x => !x.EffectiveTo.HasValue || x.EffectiveTo.Value >= x.EffectiveFrom)
            .WithMessage("Effective To date must be on or after the Effective From date.")
            .When(x => x.EffectiveTo.HasValue);

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Notes));
    }
}
