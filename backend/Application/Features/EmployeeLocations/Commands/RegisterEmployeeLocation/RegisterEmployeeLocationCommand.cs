using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.RegisterEmployeeLocation;

public record RegisterEmployeeLocationCommand(
    double Latitude,
    double Longitude,
    double? AccuracyMeters,
    string? AddressDescription) : IRequest<GenericBaseResponse<MyLocationStatusDto>>;
