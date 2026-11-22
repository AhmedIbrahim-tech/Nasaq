using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.AdminResetPassword;

public record AdminResetPasswordCommand(string UserId) : IRequest<GenericBaseResponse<bool>>;
