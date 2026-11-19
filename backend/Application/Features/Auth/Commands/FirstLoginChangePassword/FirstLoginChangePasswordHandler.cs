using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.FirstLoginChangePassword;

public sealed class FirstLoginChangePasswordHandler(IAuthService authService)
    : IRequestHandler<FirstLoginChangePasswordCommand, GenericBaseResponse<AuthResponse>>
{
    public Task<GenericBaseResponse<AuthResponse>> Handle(
        FirstLoginChangePasswordCommand command,
        CancellationToken cancellationToken) =>
        authService.FirstLoginChangePasswordAsync(command.Request, cancellationToken);
}
