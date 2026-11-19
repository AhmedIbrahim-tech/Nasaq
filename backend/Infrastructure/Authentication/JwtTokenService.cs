using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Abstractions;
using Application.Configuration;
using Application.Models.Auth;
using Domain.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Authentication;

public sealed class JwtTokenService(
    IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory,
    IOptions<JwtSettings> jwtSettings) : ITokenService
{
    public async Task<AccessTokenResult> CreateAccessTokenAsync(ApplicationUser user, CancellationToken cancellationToken = default)
    {
        var settings = jwtSettings.Value;
        if (string.IsNullOrWhiteSpace(settings.Secret) || settings.Secret.Length < 32)
            throw new InvalidOperationException("Jwt:Secret must be configured with at least 32 characters.");

        var principal = await claimsFactory.CreateAsync(user);
        var expires = DateTime.UtcNow.AddMinutes(settings.AccessTokenExpireDate);

        var claims = new List<Claim>(principal.Claims);
        if (!claims.Any(c => c.Type == JwtRegisteredClaimNames.Sub))
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, user.Id));
        if (!string.IsNullOrEmpty(user.Email) && !claims.Any(c => c.Type == JwtRegisteredClaimNames.Email || c.Type == ClaimTypes.Email))
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));
        if (!string.IsNullOrEmpty(user.FullName) && !claims.Any(c => c.Type == JwtRegisteredClaimNames.Name || c.Type == ClaimTypes.Name))
            claims.Add(new Claim(JwtRegisteredClaimNames.Name, user.FullName));
        if (!string.IsNullOrEmpty(user.SecurityStamp) && !claims.Any(c => c.Type == "AspNet.Identity.SecurityStamp" || c.Type == "security_stamp"))
            claims.Add(new Claim("AspNet.Identity.SecurityStamp", user.SecurityStamp));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: settings.Issuer,
            audience: settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expires,
            signingCredentials: credentials);

        return new AccessTokenResult(new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
