namespace Application.Features.Employees.Commands.UpdateEmployee;

public sealed record UpdateEmployeeCommand(
    Guid Id = default,
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
    string? UserRole = null,
    string? UserId = null,
    Guid? SupervisorId = null,
    Guid? WorkLocationId = null,
    IFormFile? ProfilePhoto = null,
    bool RemoveProfilePhoto = false
) : IRequest<GenericBaseResponse<EmployeeDto>>;
