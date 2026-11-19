using Application.Models.Auth;
using Domain.Identity;

namespace Application.Abstractions;

public interface ITokenService
{
    Task<AccessTokenResult> CreateAccessTokenAsync(ApplicationUser user, CancellationToken cancellationToken = default);
}
