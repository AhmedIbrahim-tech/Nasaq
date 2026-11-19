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
        Department = user.Department
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
        Roles = roles
    };
}
