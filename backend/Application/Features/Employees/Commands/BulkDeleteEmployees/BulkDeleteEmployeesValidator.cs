namespace Application.Features.Employees.Commands.BulkDeleteEmployees;

public sealed class BulkDeleteEmployeesValidator : AbstractValidator<BulkDeleteEmployeesCommand>
{
    public BulkDeleteEmployeesValidator()
    {
        RuleFor(x => x.Ids)
            .NotNull().WithMessage("Selection cannot be null.")
            .NotEmpty().WithMessage("Selection cannot be empty.");
    }
}
