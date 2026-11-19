using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Configuration;
using Domain.Authorization;
using Domain.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Data;

public sealed class DbInitializer(
    RoleManager<ApplicationRole> roleManager,
    UserManager<ApplicationUser> userManager,
    IOptions<DefaultAdminOptions> options,
    ILogger<DbInitializer> logger)
{
    private readonly DefaultAdminOptions _options = options.Value;

    public async Task SeedAsync()
    {
        if (!_options.AutoSeed)
        {
            return;
        }

        await SeedRolesAsync();
        await SeedAdminUserAsync();
    }

    private async Task SeedRolesAsync()
    {
        string[] roles = [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.User];

        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var role = new ApplicationRole
                {
                    Name = roleName,
                    NormalizedName = roleName.ToUpperInvariant()
                };

                var result = await roleManager.CreateAsync(role);
                if (result.Succeeded)
                {
                    logger.LogInformation("Seeded default role: {Role}", roleName);

                    if (roleName == RoleNames.SuperAdmin)
                    {
                        await roleManager.AddClaimAsync(role, new Claim("permission", Permissions.Users.View));
                        await roleManager.AddClaimAsync(role, new Claim("permission", Permissions.Users.Manage));
                        await roleManager.AddClaimAsync(role, new Claim("permission", Permissions.Roles.View));
                        await roleManager.AddClaimAsync(role, new Claim("permission", Permissions.Roles.Manage));
                    }
                }
                else
                {
                    logger.LogError("Failed to seed role {Role}: {Errors}", roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }

    private async Task SeedAdminUserAsync()
    {
        var email = _options.Email.Trim();
        var adminUser = await userManager.FindByEmailAsync(email);

        if (adminUser is null)
        {
            adminUser = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = _options.FullName,
                JobTitle = _options.JobTitle,
                Department = _options.Department,
                EmailConfirmed = true,
                IsActive = true,
                MustChangePasswordOnNextLogin = false
            };

            var createResult = await userManager.CreateAsync(adminUser, _options.Password);
            if (createResult.Succeeded)
            {
                logger.LogInformation("Seeded default administrator user: {Email}", email);

                await userManager.AddToRolesAsync(adminUser, [RoleNames.SuperAdmin, RoleNames.Admin]);
            }
            else
            {
                logger.LogError("Failed to seed admin user: {Errors}", string.Join(", ", createResult.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            var currentRoles = await userManager.GetRolesAsync(adminUser);
            if (!currentRoles.Contains(RoleNames.SuperAdmin))
            {
                await userManager.AddToRoleAsync(adminUser, RoleNames.SuperAdmin);
            }
            if (!currentRoles.Contains(RoleNames.Admin))
            {
                await userManager.AddToRoleAsync(adminUser, RoleNames.Admin);
            }
        }
    }
}
