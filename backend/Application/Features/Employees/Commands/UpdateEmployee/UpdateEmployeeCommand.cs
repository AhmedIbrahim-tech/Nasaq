namespace Application.Features.Employees.Commands.UpdateEmployee;

public sealed record UpdateEmployeeCommand(
    Guid Id = default,
    string FirstName = "",
    string LastName = "",
    string Email = "",
    string? PhoneNumber = null,
    string? Department = null,
    string? JobTitle = null,
    DateTime HireDate = default,
    string? UserRole = null,
    string? UserId = null,
    Guid? SupervisorId = null,
    IFormFile? ProfilePhoto = null,
    bool RemoveProfilePhoto = false
) : IRequest<GenericBaseResponse<EmployeeDto>>;
