namespace Application.Features.Employees.Commands.CreateEmployee;

public sealed record CreateEmployeeCommand(
    string EmployeeCode = "",
    string FirstName = "",
    string LastName = "",
    string Email = "",
    string? PhoneNumber = null,
    string? Department = null,
    string? JobTitle = null,
    DateTime HireDate = default,
    bool CreateUserAccount = false,
    string? UserRole = null,
    string? Password = null,
    string? UserId = null,
    Guid? SupervisorId = null,
    IFormFile? ProfilePhoto = null
) : IRequest<GenericBaseResponse<EmployeeDto>>;
