namespace Application.Features.Employees.Commands.UpdateEmployee;

public sealed record UpdateEmployeeCommand(
    Guid Id,
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
) : IRequest<GenericBaseResponse<EmployeeDto>>;
