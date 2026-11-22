using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Queries.GetMyPersonalLocation;

public record GetMyPersonalLocationQuery : IRequest<GenericBaseResponse<MyLocationStatusDto>>;
