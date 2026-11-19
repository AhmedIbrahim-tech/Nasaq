namespace Application.Features.Employees.Queries.GetSupervisors;

public sealed record GetSupervisorsQuery : IRequest<GenericBaseResponse<List<SupervisorLookupDto>>>;
