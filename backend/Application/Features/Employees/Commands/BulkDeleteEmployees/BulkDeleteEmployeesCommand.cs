namespace Application.Features.Employees.Commands.BulkDeleteEmployees;

public sealed record BulkDeleteEmployeesCommand(List<Guid> Ids) : IRequest<GenericBaseResponse<int>>;
