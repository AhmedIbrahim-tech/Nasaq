namespace Application.Features.Employees.Commands.CreateEmployee;

public sealed record CreateEmployeeCommand(
    string EmployeeCode,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string? Department,
    string? JobTitle,
    DateTime HireDate,
    bool CreateUserAccount = false,
    string? UserRole = null,
    string? Password = null,
    string? UserId = null,
    Guid? SupervisorId = null
) : IRequest<GenericBaseResponse<EmployeeDto>>;
