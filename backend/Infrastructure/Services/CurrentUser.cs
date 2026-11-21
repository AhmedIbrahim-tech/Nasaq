using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Application.Abstractions;
using Domain.Authorization;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services;

public sealed class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public string? UserId =>
        User?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? User?.FindFirstValue("sub");

    public string? UserName =>
        User?.FindFirstValue(ClaimTypes.Name)
        ?? User?.Identity?.Name;

    public IReadOnlyList<string> Roles =>
        User?.Claims
            .Where(c => c.Type is ClaimTypes.Role or "role" or "roles")
            .Select(c => c.Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList()
            .AsReadOnly()
        ?? (IReadOnlyList<string>)Array.Empty<string>();

    public bool IsInRole(string role) => Roles.Any(r => string.Equals(r, role, StringComparison.OrdinalIgnoreCase));
    public bool IsSuperAdmin => IsInRole(RoleNames.SuperAdmin);
    public bool IsAdmin => IsInRole(RoleNames.Admin);
    public bool IsSupervisor => IsInRole(RoleNames.Supervisor);
    public bool IsEmployee => IsInRole(RoleNames.Employee);
}
