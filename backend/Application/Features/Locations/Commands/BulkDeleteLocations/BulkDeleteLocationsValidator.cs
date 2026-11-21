namespace Application.Features.Locations.Commands.BulkDeleteLocations;

public sealed class BulkDeleteLocationsValidator : AbstractValidator<BulkDeleteLocationsCommand>
{
    public BulkDeleteLocationsValidator()
    {
        RuleFor(x => x.Ids)
            .NotNull().WithMessage("Selection cannot be null.")
            .NotEmpty().WithMessage("Selection cannot be empty.");
    }
}
