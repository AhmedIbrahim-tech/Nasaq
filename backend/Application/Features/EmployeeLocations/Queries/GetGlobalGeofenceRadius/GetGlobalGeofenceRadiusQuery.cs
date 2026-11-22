using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Queries.GetGlobalGeofenceRadius;

public record GetGlobalGeofenceRadiusQuery : IRequest<GenericBaseResponse<GlobalGeofenceRadiusDto>>;
