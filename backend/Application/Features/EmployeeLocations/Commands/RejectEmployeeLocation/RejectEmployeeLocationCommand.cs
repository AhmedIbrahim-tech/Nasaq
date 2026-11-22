using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.RejectEmployeeLocation;

public record RejectEmployeeLocationCommand(Guid RequestId, string RejectionReason) : IRequest<GenericBaseResponse<bool>>;
