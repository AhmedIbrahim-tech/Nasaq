using System.Security.Cryptography;
using System.Text;
using Application.Abstractions;
using Domain.Identity;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public sealed class RefreshTokenService(ApplicationDbContext db) : IRefreshTokenService
{
    public async Task<IssuedRefreshToken> IssueAsync(string userId, DateTime expiresAtUtc, CancellationToken cancellationToken = default)
    {
        var plain = CreatePlainToken();
        var entity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = Hash(plain),
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = expiresAtUtc
        };

        db.RefreshTokens.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return new IssuedRefreshToken(plain, entity.Id, userId, entity.ExpiresAtUtc);
    }

    public async Task<IssuedRefreshToken?> RotateAsync(string refreshToken, DateTime newExpiresAtUtc, CancellationToken cancellationToken = default)
    {
        var hash = Hash(refreshToken);
        var existing = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);
        if (existing is null)
            return null;

        if (existing.RevokedAtUtc is not null)
        {
            await RevokeAllForUserAsync(existing.UserId, cancellationToken);
            return null;
        }

        if (existing.ExpiresAtUtc <= DateTime.UtcNow)
            return null;

        var issued = await IssueAsync(existing.UserId, newExpiresAtUtc, cancellationToken);
        existing.RevokedAtUtc = DateTime.UtcNow;
        existing.ReplacedByTokenId = issued.TokenId;
        await db.SaveChangesAsync(cancellationToken);
        return issued;
    }

    public async Task<bool> RevokeAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var hash = Hash(refreshToken);
        var existing = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);
        if (existing is null)
            return false;

        if (existing.RevokedAtUtc is null)
        {
            existing.RevokedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }

        return true;
    }

    public async Task RevokeAllForUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var tokens = await db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAtUtc == null)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var token in tokens)
            token.RevokedAtUtc = now;

        await db.SaveChangesAsync(cancellationToken);
    }

    private static string CreatePlainToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    private static string Hash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
