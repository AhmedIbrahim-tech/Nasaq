using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.AdminChangeEmployeeLocation;

public record AdminChangeEmployeeLocationCommand(
    Guid EmployeeId,
    double Latitude,
    double Longitude,
    double? AccuracyMeters,
    string? AddressDescription,
    string? AdminNotes) : IRequest<GenericBaseResponse<EmployeePersonalLocationDto>>;
