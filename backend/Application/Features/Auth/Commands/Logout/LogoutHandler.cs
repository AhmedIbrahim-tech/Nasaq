using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.Logout;

public sealed class LogoutHandler(IAuthService authService)
    : IRequestHandler<LogoutCommand, GenericBaseResponse<object?>>
{
    public Task<GenericBaseResponse<object?>> Handle(
        LogoutCommand command,
        CancellationToken cancellationToken) =>
        authService.LogoutAsync(command.Request, cancellationToken);
}
