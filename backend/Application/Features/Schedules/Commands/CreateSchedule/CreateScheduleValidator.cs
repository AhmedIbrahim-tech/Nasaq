namespace Application.Features.Schedules.Commands.CreateSchedule;

public sealed class CreateScheduleValidator : AbstractValidator<CreateScheduleCommand>
{
    public CreateScheduleValidator()
    {
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Name) || !string.IsNullOrWhiteSpace(x.NameEn) || !string.IsNullOrWhiteSpace(x.NameAr))
            .WithMessage("Schedule name is required in at least one language.");

        When(x => !string.IsNullOrWhiteSpace(x.Name), () =>
        {
            RuleFor(x => x.Name).MaximumLength(150).WithMessage("Schedule name must not exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NameEn), () =>
        {
            RuleFor(x => x.NameEn!).MaximumLength(150).WithMessage("English schedule name must not exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NameAr), () =>
        {
            RuleFor(x => x.NameAr!).MaximumLength(150).WithMessage("Arabic schedule name must not exceed 150 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Description), () =>
        {
            RuleFor(x => x.Description!).MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.DescriptionEn), () =>
        {
            RuleFor(x => x.DescriptionEn!).MaximumLength(500).WithMessage("English description must not exceed 500 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.DescriptionAr), () =>
        {
            RuleFor(x => x.DescriptionAr!).MaximumLength(500).WithMessage("Arabic description must not exceed 500 characters.");
        });

        RuleForEach(x => x.Days)
            .Must(day => !day.IsWorkingDay || (day.WorkShiftId.HasValue && day.WorkShiftId != Guid.Empty))
            .WithMessage("A working day must have an assigned work shift.");
    }
}
