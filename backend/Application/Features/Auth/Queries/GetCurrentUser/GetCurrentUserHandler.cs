using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Queries.GetCurrentUser;

public sealed class GetCurrentUserHandler(IAuthService authService)
    : IRequestHandler<GetCurrentUserQuery, GenericBaseResponse<CurrentUserResponse>>
{
    public Task<GenericBaseResponse<CurrentUserResponse>> Handle(
        GetCurrentUserQuery request,
        CancellationToken cancellationToken) =>
        authService.GetCurrentUserAsync(request.UserId, cancellationToken);
}
