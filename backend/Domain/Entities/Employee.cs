namespace Domain.Entities;

public class Employee : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string EmployeeCode { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Department { get; set; }

    public string? JobTitle { get; set; }

    public DateTime HireDate { get; set; }

    public bool IsActive { get; set; } = true;

    public string? UserId { get; set; }
    public virtual ApplicationUser? User { get; set; }

    public Guid? SupervisorId { get; set; }
    public virtual Employee? Supervisor { get; set; }
    public virtual ICollection<Employee> SupervisedEmployees { get; set; } = new List<Employee>();

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();
}
