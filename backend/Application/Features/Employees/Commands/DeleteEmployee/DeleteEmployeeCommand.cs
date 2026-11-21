namespace Application.Features.Employees.Commands.DeleteEmployee;

public sealed record DeleteEmployeeCommand(Guid Id) : IRequest<GenericBaseResponse<object?>>;
