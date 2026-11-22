using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.UpdateCompanyLocationCoordinates;

public record UpdateCompanyLocationCoordinatesCommand(
    Guid LocationId,
    double Latitude,
    double Longitude) : IRequest<GenericBaseResponse<bool>>;
