using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.RefreshToken;

public sealed class RefreshTokenHandler(IAuthService authService)
    : IRequestHandler<RefreshTokenCommand, GenericBaseResponse<AuthResponse>>
{
    public Task<GenericBaseResponse<AuthResponse>> Handle(
        RefreshTokenCommand command,
        CancellationToken cancellationToken) =>
        authService.RefreshAsync(command.Request, cancellationToken);
}
