namespace Application.Features.Employees.DTOs;

public sealed record UpdateEmployeeRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string? Department,
    string? JobTitle,
    DateTime HireDate,
    string? UserRole = null,
    string? UserId = null,
    Guid? SupervisorId = null
);

public sealed record ToggleStatusRequest(
    bool? IsActive = null
);
