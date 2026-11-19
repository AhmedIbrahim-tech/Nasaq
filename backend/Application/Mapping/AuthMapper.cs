using Domain.DTOs.Auth;
using Domain.Identity;

namespace Application.Mapping;

public static class AuthMapper
{
    public static AuthUserResponse ToUserResponse(ApplicationUser user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        JobTitle = user.JobTitle,
        Department = user.Department,
        ProfileImagePath = user.ProfileImagePath,
        AvatarUrl = ToPublicUrl(user.ProfileImagePath)
    };

    public static CurrentUserResponse ToCurrentUserResponse(
        ApplicationUser user,
        IReadOnlyList<string> roles) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        JobTitle = user.JobTitle,
        Department = user.Department,
        ProfileImagePath = user.ProfileImagePath,
        AvatarUrl = ToPublicUrl(user.ProfileImagePath),
        Roles = roles
    };

    private static string? ToPublicUrl(string? relativePath) =>
        string.IsNullOrWhiteSpace(relativePath) ? null : "/" + relativePath.TrimStart('/').Replace('\\', '/');
}
