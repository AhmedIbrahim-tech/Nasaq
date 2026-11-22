using Domain.Common;
using MediatR;

namespace Application.Features.EmployeeLocations.Commands.ApproveEmployeeLocation;

public record ApproveEmployeeLocationCommand(Guid RequestId, string? AdminNotes = null) : IRequest<GenericBaseResponse<bool>>;
