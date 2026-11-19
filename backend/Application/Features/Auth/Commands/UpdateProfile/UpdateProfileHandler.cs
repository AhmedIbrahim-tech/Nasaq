using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.UpdateProfile;

public sealed class UpdateProfileHandler(IAuthService authService)
    : IRequestHandler<UpdateProfileCommand, GenericBaseResponse<CurrentUserResponse>>
{
    public Task<GenericBaseResponse<CurrentUserResponse>> Handle(
        UpdateProfileCommand command,
        CancellationToken cancellationToken) =>
        authService.UpdateProfileAsync(command.UserId, command.Request, cancellationToken);
}
