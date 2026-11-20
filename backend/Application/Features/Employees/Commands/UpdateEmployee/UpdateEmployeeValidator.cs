namespace Application.Features.Employees.Commands.UpdateEmployee;

public sealed class UpdateEmployeeValidator : AbstractValidator<UpdateEmployeeCommand>
{
    public UpdateEmployeeValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Employee ID is required.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(256).WithMessage("Email cannot exceed 256 characters.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(50).WithMessage("Phone number cannot exceed 50 characters.");

        RuleFor(x => x.Department)
            .MaximumLength(100).WithMessage("Department cannot exceed 100 characters.");

        RuleFor(x => x.JobTitle)
            .MaximumLength(100).WithMessage("Job title cannot exceed 100 characters.");

        RuleFor(x => x.HireDate)
            .NotEmpty().WithMessage("Hire date is required.");

        RuleFor(x => x)
            .Must(x => !(x.ProfilePhoto != null && x.RemoveProfilePhoto))
            .WithMessage("Cannot upload a new profile photo and request removal at the same time.");

        When(x => x.ProfilePhoto != null, () =>
        {
            RuleFor(x => x.ProfilePhoto!.FileName)
                .NotEmpty().WithMessage("Profile photo file name is required.");

            RuleFor(x => x.ProfilePhoto!.Length)
                .GreaterThan(0).WithMessage("Profile photo file cannot be empty.");
        });
    }
}
