namespace Application.Abstractions;

public interface ITemporaryPasswordService
{
    bool ShouldUseFixedDevelopmentPassword();

    string GenerateTemporaryPassword();

    Task<IdentityResult> CreateUserWithTemporaryPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string temporaryPassword);

    Task<IdentityResult> ResetPasswordWithTemporaryPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string temporaryPassword);
}
