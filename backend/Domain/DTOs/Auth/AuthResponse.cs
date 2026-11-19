namespace Domain.DTOs.Auth;

public sealed class AuthResponse
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public DateTime AccessTokenExpiresAtUtc { get; init; }
    public DateTime RefreshTokenExpiresAtUtc { get; init; }
    public AuthUserResponse User { get; init; } = new();
    public IReadOnlyList<string> Roles { get; init; } = [];
    public bool RequiresPasswordChange { get; init; } = false;
    public string? SetupToken { get; init; }
}
