using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Abstractions;
using Application.Common;
using Application.Configuration;
using Application.Mapping;
using Domain.Common;
using Domain.DTOs.Auth;
using Domain.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ITokenService tokenService,
    IRefreshTokenService refreshTokenService,
    IOptions<JwtSettings> jwtSettings,
    IApplicationDbContext dbContext) : ResponseHandler, IAuthService
{
    private const string InvalidCredentials = "Invalid email or password.";

    public async Task<GenericBaseResponse<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Unauthorized<AuthResponse>(InvalidCredentials);

        if (!user.IsActive)
            return Unauthorized<AuthResponse>("This account has been deactivated. Please contact your platform administrator.");

        if (await userManager.IsLockedOutAsync(user))
            return Unauthorized<AuthResponse>("This account is temporarily locked due to multiple failed login attempts.");

        var signIn = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!signIn.Succeeded)
            return Unauthorized<AuthResponse>(InvalidCredentials);

        // Check temporary password & first login requirement
        if (user.MustChangePasswordOnNextLogin)
        {
            if (user.TemporaryPasswordExpiresAtUtc.HasValue && user.TemporaryPasswordExpiresAtUtc.Value < DateTime.UtcNow)
            {
                return Unauthorized<AuthResponse>("The temporary password has expired. Please contact your platform administrator.");
            }

            var setupToken = CreateSetupToken(user);
            var roles = await userManager.GetRolesAsync(user);
            var employee = await dbContext.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == user.Id, cancellationToken);

            return Success(new AuthResponse
            {
                RequiresPasswordChange = true,
                SetupToken = setupToken,
                User = AuthMapper.ToUserResponse(user, employee),
                Roles = roles.ToList()
            }, "Password change is required before accessing the system.");
        }

        return Success(await IssueAsync(user, request.RememberMe, cancellationToken));
    }

    public async Task<GenericBaseResponse<AuthResponse>> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return Unauthorized<AuthResponse>(InvalidCredentials);

        var expires = DateTime.UtcNow.AddDays(jwtSettings.Value.RefreshTokenExpireDate);
        var rotated = await refreshTokenService.RotateAsync(request.RefreshToken, expires, cancellationToken);
        if (rotated is null)
            return Unauthorized<AuthResponse>(InvalidCredentials);

        var user = await userManager.FindByIdAsync(rotated.UserId);
        if (user is null || !user.IsActive)
            return Unauthorized<AuthResponse>(InvalidCredentials);

        if (await userManager.IsLockedOutAsync(user))
            return Unauthorized<AuthResponse>(InvalidCredentials);

        if (user.MustChangePasswordOnNextLogin)
            return Unauthorized<AuthResponse>(InvalidCredentials);

        return Success(await BuildResponseAsync(user, rotated.PlainToken, rotated.ExpiresAtUtc, cancellationToken));
    }

    public async Task<GenericBaseResponse<object?>> LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
            await refreshTokenService.RevokeAsync(request.RefreshToken, cancellationToken);
        return Success<object?>(null, "Success");
    }

    public async Task<GenericBaseResponse<CurrentUserResponse>> GetCurrentUserAsync(string? userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<CurrentUserResponse>();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
            return Unauthorized<CurrentUserResponse>();

        var roles = await userManager.GetRolesAsync(user);
        var employee = await dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == user.Id, cancellationToken);

        return Success(AuthMapper.ToCurrentUserResponse(user, roles.ToList(), employee));
    }

    public async Task<GenericBaseResponse<CurrentUserResponse>> UpdateProfileAsync(string? userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<CurrentUserResponse>();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
            return Unauthorized<CurrentUserResponse>();

        var employee = await dbContext.Employees
            .FirstOrDefaultAsync(e => e.UserId == user.Id, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            var trimmed = request.FullName.Trim();
            user.FullName = trimmed;
            if (employee != null)
            {
                var parts = trimmed.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                employee.FirstName = parts[0];
                employee.LastName = parts.Length > 1 ? parts[1] : string.Empty;
            }
        }

        if (request.PhoneNumber is not null)
        {
            var trimmedPhone = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
            user.PhoneNumber = trimmedPhone;
            if (employee != null)
            {
                employee.PhoneNumber = trimmedPhone;
            }
        }

        if (request.JobTitle is not null)
        {
            var trimmedTitle = string.IsNullOrWhiteSpace(request.JobTitle) ? null : request.JobTitle.Trim();
            user.JobTitle = trimmedTitle;
            if (employee != null)
            {
                employee.JobTitle = trimmedTitle;
            }
        }

        if (request.Department is not null)
        {
            var trimmedDept = string.IsNullOrWhiteSpace(request.Department) ? null : request.Department.Trim();
            user.Department = trimmedDept;
            if (employee != null)
            {
                employee.Department = trimmedDept;
            }
        }

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Fail<CurrentUserResponse>(string.Join("; ", updateResult.Errors.Select(e => e.Description)));

        if (employee != null)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var roles = await userManager.GetRolesAsync(user);

        return Success(AuthMapper.ToCurrentUserResponse(user, roles.ToList(), employee), "Profile updated successfully.");
    }

    public async Task<GenericBaseResponse<bool>> ChangePasswordAsync(string? userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<bool>();

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            return Fail<bool>("Current password is required.");

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            return Fail<bool>("New password is required.");

        if (request.NewPassword != request.ConfirmPassword)
            return Fail<bool>("New password and confirmation password do not match.");

        if (string.Equals(request.CurrentPassword, request.NewPassword, StringComparison.Ordinal))
            return Fail<bool>("New password cannot be the same as the current password.");

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
            return Unauthorized<bool>();

        var changeResult = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!changeResult.Succeeded)
            return Fail<bool>(string.Join("; ", changeResult.Errors.Select(e => e.Description)));

        // Clear any pending temporary password state upon successful password change
        user.MustChangePasswordOnNextLogin = false;
        user.TemporaryPasswordExpiresAtUtc = null;
        await userManager.UpdateAsync(user);

        // Invalidate existing sessions by updating security stamp and revoking refresh tokens
        await refreshTokenService.RevokeAllForUserAsync(user.Id, cancellationToken);
        await userManager.UpdateSecurityStampAsync(user);

        return Success(true, "Password changed successfully.");
    }

    public async Task<GenericBaseResponse<AuthResponse>> FirstLoginChangePasswordAsync(
        FirstLoginChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.SetupToken))
            return Fail<AuthResponse>("Setup token is required.");

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            return Fail<AuthResponse>("New password is required.");

        if (request.NewPassword != request.ConfirmPassword)
            return Fail<AuthResponse>("New password and confirmation password do not match.");

        var settings = jwtSettings.Value;
        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Secret)),
            ValidateIssuer = true,
            ValidIssuer = settings.Issuer,
            ValidateAudience = true,
            ValidAudience = "corestarter-first-login-setup",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        ClaimsPrincipal principal;
        try
        {
            principal = tokenHandler.ValidateToken(request.SetupToken, validationParameters, out _);
        }
        catch
        {
            return Unauthorized<AuthResponse>("The password change session is invalid or has expired. Please log in again.");
        }

        var purpose = principal.FindFirst("purpose")?.Value;
        if (purpose != "first_login_password_change")
            return Unauthorized<AuthResponse>("Invalid token purpose.");

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized<AuthResponse>("Invalid credentials in setup token.");

        var user = await userManager.FindByIdAsync(userId);
        if (user is null || !user.IsActive)
            return Unauthorized<AuthResponse>("User account was not found or is inactive.");

        if (!user.MustChangePasswordOnNextLogin)
            return Fail<AuthResponse>("Password change is not pending for this account.");

        // Security check: bind setup token to current security stamp to invalidate old sessions immediately
        var tokenSecurityStamp = principal.FindFirst("security_stamp")?.Value;
        if (!string.IsNullOrEmpty(tokenSecurityStamp) && !string.Equals(user.SecurityStamp, tokenSecurityStamp, StringComparison.Ordinal))
            return Unauthorized<AuthResponse>("The password change session is invalid. Please log in again.");

        // Enforce 24-hour expiration check
        if (user.TemporaryPasswordExpiresAtUtc.HasValue && user.TemporaryPasswordExpiresAtUtc.Value < DateTime.UtcNow)
            return Unauthorized<AuthResponse>("The temporary password has expired. Please contact your platform administrator.");

        // Check that new password is not identical to current temporary password
        if (await userManager.CheckPasswordAsync(user, request.NewPassword))
            return Fail<AuthResponse>("New password cannot be identical to the temporary password.");

        // Validate password policy against all registered validators
        foreach (var validator in userManager.PasswordValidators)
        {
            var valResult = await validator.ValidateAsync(userManager, user, request.NewPassword);
            if (!valResult.Succeeded)
                return Fail<AuthResponse>(string.Join("; ", valResult.Errors.Select(e => e.Description)));
        }

        // Apply new password and clear temporary flags atomically without destructive RemovePasswordAsync
        user.PasswordHash = userManager.PasswordHasher.HashPassword(user, request.NewPassword);
        user.MustChangePasswordOnNextLogin = false;
        user.TemporaryPasswordExpiresAtUtc = null;
        await userManager.UpdateSecurityStampAsync(user);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Fail<AuthResponse>(string.Join("; ", updateResult.Errors.Select(e => e.Description)));

        await refreshTokenService.RevokeAllForUserAsync(user.Id, cancellationToken);

        // Issue fresh normal authenticated session
        var authResponse = await IssueAsync(user, false, cancellationToken);
        return Success(authResponse, "Password updated successfully.");
    }

    private string CreateSetupToken(ApplicationUser user)
    {
        var settings = jwtSettings.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(15);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim("purpose", "first_login_password_change"),
            new Claim("security_stamp", user.SecurityStamp ?? string.Empty)
        };

        var token = new JwtSecurityToken(
            issuer: settings.Issuer,
            audience: "corestarter-first-login-setup",
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expires,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<AuthResponse> IssueAsync(ApplicationUser user, bool rememberMe, CancellationToken cancellationToken)
    {
        var days = rememberMe
            ? jwtSettings.Value.RefreshTokenExpireDate
            : Math.Min(jwtSettings.Value.RefreshTokenExpireDate, 1);
        var refreshExpires = DateTime.UtcNow.AddDays(days);
        var refresh = await refreshTokenService.IssueAsync(user.Id, refreshExpires, cancellationToken);
        return await BuildResponseAsync(user, refresh.PlainToken, refresh.ExpiresAtUtc, cancellationToken);
    }

    private async Task<AuthResponse> BuildResponseAsync(
        ApplicationUser user,
        string refreshToken,
        DateTime refreshExpiresAtUtc,
        CancellationToken cancellationToken)
    {
        var access = await tokenService.CreateAccessTokenAsync(user, cancellationToken);
        var roles = await userManager.GetRolesAsync(user);
        var employee = await dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == user.Id, cancellationToken);

        return new AuthResponse
        {
            AccessToken = access.AccessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAtUtc = access.ExpiresAtUtc,
            RefreshTokenExpiresAtUtc = refreshExpiresAtUtc,
            User = AuthMapper.ToUserResponse(user, employee),
            Roles = roles.ToList()
        };
    }
}
