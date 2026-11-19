namespace Application.Features.Employees.Queries.GetCurrentEmployeeProfile;

public sealed record GetCurrentEmployeeProfileQuery : IRequest<GenericBaseResponse<EmployeeDto>>;
