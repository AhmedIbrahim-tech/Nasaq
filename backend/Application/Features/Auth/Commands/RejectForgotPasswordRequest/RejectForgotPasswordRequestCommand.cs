using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.RejectForgotPasswordRequest;

public record RejectForgotPasswordRequestCommand(Guid RequestId, string? RejectionReason = null) : IRequest<GenericBaseResponse<bool>>;
