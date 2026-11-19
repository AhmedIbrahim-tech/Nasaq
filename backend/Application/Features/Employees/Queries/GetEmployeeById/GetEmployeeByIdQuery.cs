namespace Application.Features.Employees.Queries.GetEmployeeById;

public sealed record GetEmployeeByIdQuery(Guid Id) : IRequest<GenericBaseResponse<EmployeeDto>>;
