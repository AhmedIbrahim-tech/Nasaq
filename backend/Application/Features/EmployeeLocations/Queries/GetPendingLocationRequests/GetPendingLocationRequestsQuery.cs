using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Queries.GetPendingLocationRequests;

public record GetPendingLocationRequestsQuery : IRequest<GenericBaseResponse<List<EmployeeLocationRequestDto>>>;
