using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.Login;

public sealed class LoginHandler(IAuthService authService)
    : IRequestHandler<LoginCommand, GenericBaseResponse<AuthResponse>>
{
    public Task<GenericBaseResponse<AuthResponse>> Handle(
        LoginCommand command,
        CancellationToken cancellationToken) =>
        authService.LoginAsync(command.Request, cancellationToken);
}
