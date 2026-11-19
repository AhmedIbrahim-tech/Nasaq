using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.ChangePassword;

public sealed class ChangePasswordHandler(IAuthService authService)
    : IRequestHandler<ChangePasswordCommand, GenericBaseResponse<bool>>
{
    public Task<GenericBaseResponse<bool>> Handle(
        ChangePasswordCommand command,
        CancellationToken cancellationToken) =>
        authService.ChangePasswordAsync(command.UserId, command.Request, cancellationToken);
}
