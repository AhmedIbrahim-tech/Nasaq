namespace Application.Features.Employees.DTOs;

public class EmployeeDto
{
    public Guid Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? FirstNameAr { get; set; }
    public string? LastNameAr { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? FullNameAr { get; set; }
    public string? FullNameEn { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Department { get; set; }
    public string? DepartmentAr { get; set; }
    public string? JobTitle { get; set; }
    public string? JobTitleAr { get; set; }
    public DateTime HireDate { get; set; }
    public bool IsActive { get; set; }
    public string? UserId { get; set; }
    public string? UserRole { get; set; }
    public Guid? SupervisorId { get; set; }
    public string? SupervisorName { get; set; }
    public string? SupervisorNameAr { get; set; }
    public string? SupervisorNameEn { get; set; }
    public string? SupervisorCode { get; set; }
    public Guid? WorkLocationId { get; set; }
    public string? WorkLocationName { get; set; }
    public string? WorkLocationNameAr { get; set; }
    public string? WorkLocationNameEn { get; set; }
    public Guid? ProfilePhoto { get; set; }
    public DateTime Created_Utc { get; set; }
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
