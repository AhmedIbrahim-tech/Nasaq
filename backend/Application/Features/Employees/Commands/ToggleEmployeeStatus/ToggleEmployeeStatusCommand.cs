namespace Application.Features.Employees.Commands.ToggleEmployeeStatus;

public sealed record ToggleEmployeeStatusCommand(
    Guid Id,
    bool? IsActive = null
) : IRequest<GenericBaseResponse<EmployeeDto>>;
