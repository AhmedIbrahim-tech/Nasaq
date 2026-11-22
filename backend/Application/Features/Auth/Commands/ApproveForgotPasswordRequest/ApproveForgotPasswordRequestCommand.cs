using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.ApproveForgotPasswordRequest;

public record ApproveForgotPasswordRequestCommand(Guid RequestId) : IRequest<GenericBaseResponse<bool>>;
