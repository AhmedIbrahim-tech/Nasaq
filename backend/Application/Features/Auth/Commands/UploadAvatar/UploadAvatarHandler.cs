using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.UploadAvatar;

public sealed class UploadAvatarHandler(IAuthService authService)
    : IRequestHandler<UploadAvatarCommand, GenericBaseResponse<string>>
{
    public Task<GenericBaseResponse<string>> Handle(
        UploadAvatarCommand command,
        CancellationToken cancellationToken) =>
        authService.UploadAvatarAsync(command.UserId, command.File, cancellationToken);
}
