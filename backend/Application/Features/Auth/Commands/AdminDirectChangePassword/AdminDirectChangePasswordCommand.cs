using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.AdminDirectChangePassword;

public record AdminDirectChangePasswordCommand(
    string UserId,
    string NewPassword,
    string ConfirmPassword) : IRequest<GenericBaseResponse<bool>>;
