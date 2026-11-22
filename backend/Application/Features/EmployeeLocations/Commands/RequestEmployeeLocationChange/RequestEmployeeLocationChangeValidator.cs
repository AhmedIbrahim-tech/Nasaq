using Application.Abstractions;
using FluentValidation;

namespace Application.Features.EmployeeLocations.Commands.RequestEmployeeLocationChange;

public class RequestEmployeeLocationChangeValidator : AbstractValidator<RequestEmployeeLocationChangeCommand>
{
    public RequestEmployeeLocationChangeValidator(IGeofenceService geofenceService)
    {
        RuleFor(x => x)
            .Must(x => geofenceService.IsValidCoordinate(x.Latitude, x.Longitude))
            .WithMessage("Invalid geographic coordinates provided.");
    }
}
