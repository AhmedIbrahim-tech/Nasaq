using Application.Abstractions;
using FluentValidation;

namespace Application.Features.EmployeeLocations.Commands.UpdateCompanyLocationCoordinates;

public class UpdateCompanyLocationCoordinatesValidator : AbstractValidator<UpdateCompanyLocationCoordinatesCommand>
{
    public UpdateCompanyLocationCoordinatesValidator(IGeofenceService geofenceService)
    {
        RuleFor(x => x)
            .Must(x => geofenceService.IsValidCoordinate(x.Latitude, x.Longitude))
            .WithMessage("Invalid coordinates provided.");
    }
}
