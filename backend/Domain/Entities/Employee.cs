namespace Domain.Entities;

public class Employee : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string EmployeeCode { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? FirstNameAr { get; set; }

    public string? LastNameAr { get; set; }

    public string FirstNameEn { get => FirstName; set => FirstName = value; }

    public string LastNameEn { get => LastName; set => LastName = value; }

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Department { get; set; }

    public string? DepartmentAr { get; set; }

    public string? JobTitle { get; set; }

    public string? JobTitleAr { get; set; }

    public DateTime HireDate { get; set; }

    public bool IsActive { get; set; } = true;

    public string? UserId { get; set; }
    public virtual ApplicationUser? User { get; set; }

    public Guid? SupervisorId { get; set; }
    public virtual Employee? Supervisor { get; set; }
    public virtual ICollection<Employee> SupervisedEmployees { get; set; } = new List<Employee>();

    public Guid? WorkLocationId { get; set; }
    public virtual WorkLocation? WorkLocation { get; set; }

    public virtual ICollection<EmployeeScheduleAssignment> ScheduleAssignments { get; set; } = new List<EmployeeScheduleAssignment>();
    public virtual ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();

    public Guid? ProfilePhoto { get; set; }

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }

    public string FullNameEn => $"{FirstName} {LastName}".Trim();

    public string FullNameAr => !string.IsNullOrWhiteSpace(FirstNameAr) || !string.IsNullOrWhiteSpace(LastNameAr)
        ? $"{FirstNameAr} {LastNameAr}".Trim()
        : FullNameEn;

    public string FullName => FullNameEn;

    public string GetFullName(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(FullNameAr)
            ? FullNameAr
            : FullNameEn;

    public string? GetDepartment(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(DepartmentAr)
            ? DepartmentAr
            : Department;

    public string? GetJobTitle(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(JobTitleAr)
            ? JobTitleAr
            : JobTitle;
}
