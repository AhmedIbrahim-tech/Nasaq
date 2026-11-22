using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.ResetEmployeeLocation;

public record ResetEmployeeLocationCommand(Guid EmployeeId, string? Reason = null) : IRequest<GenericBaseResponse<bool>>;
