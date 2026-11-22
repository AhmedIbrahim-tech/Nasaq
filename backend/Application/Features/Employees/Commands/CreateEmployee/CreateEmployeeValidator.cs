namespace Application.Features.Employees.Commands.CreateEmployee;

public sealed class CreateEmployeeValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeValidator()
    {
        RuleFor(x => x.EmployeeCode)
            .NotEmpty().WithMessage("Employee code is required.")
            .MaximumLength(50).WithMessage("Employee code cannot exceed 50 characters.");

        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.FirstName) || !string.IsNullOrWhiteSpace(x.FirstNameEn) || !string.IsNullOrWhiteSpace(x.FirstNameAr))
            .WithMessage("First name is required in at least one language.")
            .Must(x => !string.IsNullOrWhiteSpace(x.LastName) || !string.IsNullOrWhiteSpace(x.LastNameEn) || !string.IsNullOrWhiteSpace(x.LastNameAr))
            .WithMessage("Last name is required in at least one language.");

        When(x => !string.IsNullOrWhiteSpace(x.FirstName), () =>
        {
            RuleFor(x => x.FirstName).MaximumLength(100).WithMessage("First name cannot exceed 100 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.FirstNameEn), () =>
        {
            RuleFor(x => x.FirstNameEn!).MaximumLength(100).WithMessage("English first name cannot exceed 100 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.FirstNameAr), () =>
        {
            RuleFor(x => x.FirstNameAr!).MaximumLength(100).WithMessage("Arabic first name cannot exceed 100 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.LastName), () =>
        {
            RuleFor(x => x.LastName).MaximumLength(100).WithMessage("Last name cannot exceed 100 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.LastNameEn), () =>
        {
            RuleFor(x => x.LastNameEn!).MaximumLength(100).WithMessage("English last name cannot exceed 100 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.LastNameAr), () =>
        {
            RuleFor(x => x.LastNameAr!).MaximumLength(100).WithMessage("Arabic last name cannot exceed 100 characters.");
        });

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

        When(x => x.CreateUserAccount && !string.IsNullOrWhiteSpace(x.Password), () =>
        {
            RuleFor(x => x.Password)
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");
        });

        When(x => x.ProfilePhoto != null, () =>
        {
            RuleFor(x => x.ProfilePhoto!.FileName)
                .NotEmpty().WithMessage("Profile photo file name is required.");

            RuleFor(x => x.ProfilePhoto!.Length)
                .GreaterThan(0).WithMessage("Profile photo file cannot be empty.");
        });
    }
}
