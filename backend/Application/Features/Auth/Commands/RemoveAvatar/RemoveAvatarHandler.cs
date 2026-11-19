using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.RemoveAvatar;

public sealed class RemoveAvatarHandler(IAuthService authService)
    : IRequestHandler<RemoveAvatarCommand, GenericBaseResponse<bool>>
{
    public Task<GenericBaseResponse<bool>> Handle(
        RemoveAvatarCommand command,
        CancellationToken cancellationToken) =>
        authService.RemoveAvatarAsync(command.UserId, cancellationToken);
}
