namespace Application.Features.Employees.Commands.CreateEmployee;

public sealed record CreateEmployeeCommand(
    string EmployeeCode = "",
    string FirstName = "",
    string LastName = "",
    string? FirstNameAr = null,
    string? LastNameAr = null,
    string? FirstNameEn = null,
    string? LastNameEn = null,
    string Email = "",
    string? PhoneNumber = null,
    string? Department = null,
    string? DepartmentAr = null,
    string? JobTitle = null,
    string? JobTitleAr = null,
    DateTime HireDate = default,
    bool CreateUserAccount = false,
    string? UserRole = null,
    string? Password = null,
    string? UserId = null,
    Guid? SupervisorId = null,
    Guid? WorkLocationId = null,
    IFormFile? ProfilePhoto = null
) : IRequest<GenericBaseResponse<EmployeeDto>>;
