using System.Threading.Tasks;
using Domain.Identity;
using Microsoft.AspNetCore.Identity;

namespace Application.Abstractions;

public interface ITemporaryPasswordService
{
    /// <summary>
    /// Returns true if the fixed development password mode is currently active.
    /// Strictly returns false outside the Development environment, regardless of configuration.
    /// </summary>
    bool ShouldUseFixedDevelopmentPassword();

    /// <summary>
    /// Generates a strong random password (14 characters, alphanumeric + symbols) in Production
    /// or when fixed mode is disabled. In Development with fixed mode enabled, returns the secret password.
    /// Throws InvalidOperationException if fixed mode is enabled in Development but the secret is missing.
    /// </summary>
    string GenerateTemporaryPassword();

    /// <summary>
    /// Assigns the temporary password to a new user during creation.
    /// Uses UserManager.CreateAsync(user, password) for standard passwords,
    /// or an isolated PasswordHasher exception in Development when fixed password mode is enabled.
    /// </summary>
    Task<IdentityResult> CreateUserWithTemporaryPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string temporaryPassword);

    /// <summary>
    /// Assigns the temporary password to an existing user during administrative password reset.
    /// Removes existing password first, then uses UserManager.AddPasswordAsync for standard passwords,
    /// or an isolated PasswordHasher exception in Development when fixed password mode is enabled.
    /// </summary>
    Task<IdentityResult> ResetPasswordWithTemporaryPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string temporaryPassword);
}
