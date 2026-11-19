namespace Application.Models.Auth;

public sealed record AccessTokenResult(string AccessToken, DateTime ExpiresAtUtc);
