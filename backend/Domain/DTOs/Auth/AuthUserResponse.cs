namespace Domain.DTOs.Auth;

public sealed class AuthUserResponse
{
    public string Id { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? FullNameAr { get; set; }
    public string? FullNameEn { get; set; }
    public string? PhoneNumber { get; set; }
    public string? JobTitle { get; set; }
    public string? JobTitleAr { get; set; }
    public string? Department { get; set; }
    public string? DepartmentAr { get; set; }
    public Guid? ProfilePhoto { get; set; }
    public Guid? EmployeeId { get; set; }
    public bool MustChangePasswordOnNextLogin { get; set; }
    public bool HasApprovedPersonalLocation { get; set; }
    public bool HasPendingLocationRequest { get; set; }
}
