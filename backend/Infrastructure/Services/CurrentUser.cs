using System.Security.Claims;
using Application.Abstractions;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services;

public sealed class CurrentUser : ICurrentUser
{
    public string? UserId { get; }
    public string? UserName { get; }
    public bool IsAuthenticated { get; }

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            IsAuthenticated = true;
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
            UserName = user.FindFirstValue(ClaimTypes.Name) ?? user.Identity?.Name;
        }
    }
}
