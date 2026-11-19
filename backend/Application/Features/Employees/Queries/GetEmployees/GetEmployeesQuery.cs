namespace Application.Features.Employees.Queries.GetEmployees;

public sealed record GetEmployeesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? Department = null,
    bool? IsActive = null,
    string? SortBy = null,
    bool SortDescending = false
) : IRequest<GenericBaseResponse<PaginationResult<EmployeeDto>>>;
