using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.CancelLocationRequest;

public record CancelLocationRequestCommand(Guid RequestId) : IRequest<GenericBaseResponse<bool>>;
