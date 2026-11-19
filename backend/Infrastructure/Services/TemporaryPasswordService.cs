using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Infrastructure.Services;

public sealed class TemporaryPasswordService : ITemporaryPasswordService
{
    private readonly IConfiguration? _configuration;
    private readonly IHostEnvironment? _environment;

    public const string FixedPasswordConfigurationKey = "TemporaryPassword:UseFixedPasswordInDevelopment";
    public const string DevelopmentFixedPasswordSecretKey = "TemporaryPassword:DevelopmentFixedPassword";

    public TemporaryPasswordService(IConfiguration configuration, IHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    /// <summary>
    /// Default constructor for fallback usage in tests without environment or configuration,
    /// defaulting strictly to secure random password generation.
    /// </summary>
    public TemporaryPasswordService()
    {
    }

    public bool ShouldUseFixedDevelopmentPassword()
    {
        // 1. Fixed-password mode must NEVER be active outside Development, even if configuration is accidentally enabled.
        if (_environment is null || !_environment.IsDevelopment())
        {
            return false;
        }

        // 2. Default to false if absent or unconfigured.
        return _configuration?.GetValue<bool>(FixedPasswordConfigurationKey, false) ?? false;
    }

    public string GenerateTemporaryPassword()
    {
        if (ShouldUseFixedDevelopmentPassword())
        {
            var fixedPassword = _configuration?[DevelopmentFixedPasswordSecretKey];
            if (string.IsNullOrWhiteSpace(fixedPassword))
            {
                throw new InvalidOperationException(
                    $"Development fixed temporary password mode is enabled ('{FixedPasswordConfigurationKey}' = true), " +
                    $"but the required secret '{DevelopmentFixedPasswordSecretKey}' is missing or empty in .NET User Secrets.");
            }

            return fixedPassword;
        }

        return GenerateSecureRandomPassword(14);
    }

    private bool IsApprovedFixedDevelopmentPassword(string temporaryPassword)
    {
        if (!ShouldUseFixedDevelopmentPassword())
        {
            return false;
        }

        var secretPassword = _configuration?[DevelopmentFixedPasswordSecretKey];
        return !string.IsNullOrWhiteSpace(secretPassword) && temporaryPassword == secretPassword;
    }

    public async Task<IdentityResult> CreateUserWithTemporaryPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string temporaryPassword)
    {
        ArgumentNullException.ThrowIfNull(userManager);
        ArgumentNullException.ThrowIfNull(user);
        ArgumentException.ThrowIfNullOrWhiteSpace(temporaryPassword);

        if (IsApprovedFixedDevelopmentPassword(temporaryPassword))
        {
            // Strictly isolated Development-only exception for the approved fixed temporary password:
            // Hash using the registered Identity password hasher without globally weakening IdentityOptions.Password
            user.PasswordHash = userManager.PasswordHasher.HashPassword(user, temporaryPassword);

            if (string.IsNullOrEmpty(user.SecurityStamp))
            {
                user.SecurityStamp = Guid.NewGuid().ToString("D");
            }

            return await userManager.CreateAsync(user);
        }

        // Standard secure path: invokes password validators defined in IdentityOptions
        return await userManager.CreateAsync(user, temporaryPassword);
    }

    public async Task<IdentityResult> ResetPasswordWithTemporaryPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string temporaryPassword)
    {
        ArgumentNullException.ThrowIfNull(userManager);
        ArgumentNullException.ThrowIfNull(user);
        ArgumentException.ThrowIfNullOrWhiteSpace(temporaryPassword);

        if (IsApprovedFixedDevelopmentPassword(temporaryPassword))
        {
            // Strictly isolated Development-only exception for the approved fixed temporary password:
            // Hash using the registered Identity password hasher and update user directly.
            // Avoid calling RemovePasswordAsync first to prevent leaving the user in an unrecoverable passwordless state.
            user.PasswordHash = userManager.PasswordHasher.HashPassword(user, temporaryPassword);
            var stampResult = await userManager.UpdateSecurityStampAsync(user);
            if (!stampResult.Succeeded)
            {
                return stampResult;
            }

            return await userManager.UpdateAsync(user);
        }

        // Standard secure path: validate temporary password against registered password validators
        foreach (var validator in userManager.PasswordValidators)
        {
            var valResult = await validator.ValidateAsync(userManager, user, temporaryPassword);
            if (!valResult.Succeeded)
            {
                return valResult;
            }
        }

        user.PasswordHash = userManager.PasswordHasher.HashPassword(user, temporaryPassword);
        var standardStampResult = await userManager.UpdateSecurityStampAsync(user);
        if (!standardStampResult.Succeeded)
        {
            return standardStampResult;
        }

        return await userManager.UpdateAsync(user);
    }

    public static string GenerateSecureRandomPassword(int length = 14)
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string digits = "23456789";
        const string specials = "!@#$%^&*()-_=+";
        const string allChars = upper + lower + digits + specials;

        Span<char> password = stackalloc char[length];

        password[0] = upper[RandomNumberGenerator.GetInt32(upper.Length)];
        password[1] = lower[RandomNumberGenerator.GetInt32(lower.Length)];
        password[2] = digits[RandomNumberGenerator.GetInt32(digits.Length)];
        password[3] = specials[RandomNumberGenerator.GetInt32(specials.Length)];

        for (int i = 4; i < length; i++)
        {
            password[i] = allChars[RandomNumberGenerator.GetInt32(allChars.Length)];
        }

        for (int i = length - 1; i > 0; i--)
        {
            int j = RandomNumberGenerator.GetInt32(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }
}
