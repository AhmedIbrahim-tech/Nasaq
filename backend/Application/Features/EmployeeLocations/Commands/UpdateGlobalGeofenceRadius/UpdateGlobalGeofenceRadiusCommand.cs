using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.UpdateGlobalGeofenceRadius;

public record UpdateGlobalGeofenceRadiusCommand(double RadiusMeters) : IRequest<GenericBaseResponse<GlobalGeofenceRadiusDto>>;
