namespace Application.Features.Employees.Commands.ToggleEmployeeStatus;

public sealed record ToggleEmployeeStatusCommand(
    Guid Id = default,
    bool? IsActive = null
) : IRequest<GenericBaseResponse<EmployeeDto>>;
