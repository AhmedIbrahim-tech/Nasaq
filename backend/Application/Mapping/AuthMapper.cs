using Domain.DTOs.Auth;
using Domain.Entities;
using Domain.Identity;

namespace Application.Mapping;

public static class AuthMapper
{
    public static AuthUserResponse ToUserResponse(
        ApplicationUser user,
        Employee? employee = null,
        bool hasApprovedPersonalLocation = false,
        bool hasPendingLocationRequest = false) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = employee?.FullName ?? user.FullName,
        FullNameAr = employee?.FullNameAr ?? user.FullNameAr,
        FullNameEn = employee?.FullNameEn ?? user.FullName,
        PhoneNumber = employee?.PhoneNumber ?? user.PhoneNumber,
        JobTitle = employee?.JobTitle ?? user.JobTitle,
        JobTitleAr = employee?.JobTitleAr ?? user.JobTitleAr,
        Department = employee?.Department ?? user.Department,
        DepartmentAr = employee?.DepartmentAr ?? user.DepartmentAr,
        ProfilePhoto = employee?.ProfilePhoto,
        EmployeeId = employee?.Id,
        MustChangePasswordOnNextLogin = user.MustChangePasswordOnNextLogin,
        HasApprovedPersonalLocation = hasApprovedPersonalLocation,
        HasPendingLocationRequest = hasPendingLocationRequest
    };

    public static CurrentUserResponse ToCurrentUserResponse(
        ApplicationUser user,
        IReadOnlyList<string> roles,
        Employee? employee = null,
        bool hasApprovedPersonalLocation = false,
        bool hasPendingLocationRequest = false) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = employee?.FullName ?? user.FullName,
        FullNameAr = employee?.FullNameAr ?? user.FullNameAr,
        FullNameEn = employee?.FullNameEn ?? user.FullName,
        PhoneNumber = employee?.PhoneNumber ?? user.PhoneNumber,
        JobTitle = employee?.JobTitle ?? user.JobTitle,
        JobTitleAr = employee?.JobTitleAr ?? user.JobTitleAr,
        Department = employee?.Department ?? user.Department,
        DepartmentAr = employee?.DepartmentAr ?? user.DepartmentAr,
        Roles = roles,
        ProfilePhoto = employee?.ProfilePhoto,
        EmployeeId = employee?.Id,
        MustChangePasswordOnNextLogin = user.MustChangePasswordOnNextLogin,
        HasApprovedPersonalLocation = hasApprovedPersonalLocation,
        HasPendingLocationRequest = hasPendingLocationRequest
    };
}
