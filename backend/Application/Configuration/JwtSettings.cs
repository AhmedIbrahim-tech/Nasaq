namespace Application.Configuration;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public bool ValidateIssuer { get; set; } = true;
    public bool ValidateAudience { get; set; } = true;
    public bool ValidateLifeTime { get; set; } = true;
    public bool ValidateIssuerSigningKey { get; set; } = true;
    public int AccessTokenExpireDate { get; set; } = 15;
    public int RefreshTokenExpireDate { get; set; } = 30;
}
