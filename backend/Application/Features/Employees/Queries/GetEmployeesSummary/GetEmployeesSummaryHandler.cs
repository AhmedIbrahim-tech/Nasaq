namespace Application.Features.Employees.Queries.GetEmployeesSummary;

public sealed class GetEmployeesSummaryHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser)
    : IRequestHandler<GetEmployeesSummaryQuery, GenericBaseResponse<EmployeesSummaryDto>>
{
    public async Task<GenericBaseResponse<EmployeesSummaryDto>> Handle(
        GetEmployeesSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Employees.AsNoTracking().AsQueryable();

        // Supervisors can view only directly assigned staff metrics
        if (currentUser.IsSupervisor && !currentUser.IsSuperAdmin && !currentUser.IsAdmin)
        {
            if (string.IsNullOrEmpty(currentUser.UserId))
            {
                return GenericBaseResponse<EmployeesSummaryDto>.Success(new EmployeesSummaryDto());
            }

            var currentSupervisor = await dbContext.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == currentUser.UserId, cancellationToken);

            if (currentSupervisor == null)
            {
                return GenericBaseResponse<EmployeesSummaryDto>.Success(new EmployeesSummaryDto());
            }

            query = query.Where(e => e.SupervisorId == currentSupervisor.Id);
        }

        var total = await query.CountAsync(cancellationToken);
        var active = await query.CountAsync(e => e.IsActive, cancellationToken);
        var inactive = total - active;
        var assignedLocation = await query.CountAsync(e => e.WorkLocationId != null, cancellationToken);
        var unassignedLocation = total - assignedLocation;

        // Distinct supervisors overseeing staff within current scope
        var supervisorCount = await query
            .Where(e => e.SupervisorId != null)
            .Select(e => e.SupervisorId)
            .Distinct()
            .CountAsync(cancellationToken);

        var summary = new EmployeesSummaryDto
        {
            TotalEmployees = total,
            ActiveEmployees = active,
            InactiveEmployees = inactive,
            AssignedLocationCount = assignedLocation,
            UnassignedLocationCount = unassignedLocation,
            SupervisorCount = supervisorCount
        };

        return GenericBaseResponse<EmployeesSummaryDto>.Success(summary);
    }
}
