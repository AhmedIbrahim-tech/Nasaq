namespace Tests.Fakes;

public class FakeTemporaryPasswordService : ITemporaryPasswordService
{
    public bool ShouldUseFixedDevelopmentPassword() => false;

    public string GenerateTemporaryPassword() => "Temp@Password123!";

    public Task<IdentityResult> CreateUserWithTemporaryPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string temporaryPassword)
    {
        return userManager.CreateAsync(user, temporaryPassword);
    }

    public async Task<IdentityResult> ResetPasswordWithTemporaryPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string temporaryPassword)
    {
        await userManager.RemovePasswordAsync(user);
        return await userManager.AddPasswordAsync(user, temporaryPassword);
    }
}
