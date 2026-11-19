namespace Application.Abstractions;

public sealed record IssuedRefreshToken(string PlainToken, Guid TokenId, string UserId, DateTime ExpiresAtUtc);

public interface IRefreshTokenService
{
    Task<IssuedRefreshToken> IssueAsync(string userId, DateTime expiresAtUtc, CancellationToken cancellationToken = default);

    Task<IssuedRefreshToken?> RotateAsync(string refreshToken, DateTime newExpiresAtUtc, CancellationToken cancellationToken = default);

    Task<bool> RevokeAsync(string refreshToken, CancellationToken cancellationToken = default);

    Task RevokeAllForUserAsync(string userId, CancellationToken cancellationToken = default);
}
