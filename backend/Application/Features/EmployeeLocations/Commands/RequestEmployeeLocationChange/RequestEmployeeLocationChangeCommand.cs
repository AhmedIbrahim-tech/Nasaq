using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.RequestEmployeeLocationChange;

public record RequestEmployeeLocationChangeCommand(
    double Latitude,
    double Longitude,
    double? AccuracyMeters,
    string? AddressDescription) : IRequest<GenericBaseResponse<EmployeeLocationRequestDto>>;
