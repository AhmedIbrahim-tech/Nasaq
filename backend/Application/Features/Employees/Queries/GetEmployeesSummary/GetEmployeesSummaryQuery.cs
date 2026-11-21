namespace Application.Features.Employees.Queries.GetEmployeesSummary;

public sealed record GetEmployeesSummaryQuery : IRequest<GenericBaseResponse<EmployeesSummaryDto>>;
