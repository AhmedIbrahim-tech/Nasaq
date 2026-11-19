using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services;

public sealed class CurrentUser : ICurrentUser
{
    public string? UserId { get; }
    public string? UserName { get; }
    public bool IsAuthenticated { get; }
    public IReadOnlyList<string> Roles { get; }

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            IsAuthenticated = true;
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
            UserName = user.FindFirstValue(ClaimTypes.Name) ?? user.Identity?.Name;

            var userRoles = user.Claims
                .Where(c => c.Type is ClaimTypes.Role or "role" or "roles")
                .Select(c => c.Value)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            Roles = userRoles.AsReadOnly();
        }
        else
        {
            Roles = Array.Empty<string>();
        }
    }

    public bool IsInRole(string role) => Roles.Any(r => string.Equals(r, role, StringComparison.OrdinalIgnoreCase));
    public bool IsSuperAdmin => IsInRole(RoleNames.SuperAdmin);
    public bool IsAdmin => IsInRole(RoleNames.Admin);
    public bool IsSupervisor => IsInRole(RoleNames.Supervisor);
    public bool IsEmployee => IsInRole(RoleNames.Employee);
}
