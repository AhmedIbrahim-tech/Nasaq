namespace Application.Features.Employees.Queries.GetSupervisors;

public sealed class GetSupervisorsHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetSupervisorsQuery, GenericBaseResponse<List<SupervisorLookupDto>>>
{
    public async Task<GenericBaseResponse<List<SupervisorLookupDto>>> Handle(
        GetSupervisorsQuery request,
        CancellationToken cancellationToken)
    {
        var eligibleRoleIds = await dbContext.Roles
            .AsNoTracking()
            .Where(r => r.Name == RoleNames.Supervisor || r.Name == RoleNames.Admin || r.Name == RoleNames.SuperAdmin)
            .Select(r => new { r.Id, r.Name })
            .ToListAsync(cancellationToken);

        var roleMap = eligibleRoleIds.ToDictionary(r => r.Id, r => r.Name ?? string.Empty);
        var roleIdList = eligibleRoleIds.Select(r => r.Id).ToList();

        var userRolePairs = await dbContext.UserRoles
            .AsNoTracking()
            .Where(ur => roleIdList.Contains(ur.RoleId))
            .Select(ur => new { ur.UserId, ur.RoleId })
            .ToListAsync(cancellationToken);

        var userSupervisorRoleMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var pair in userRolePairs)
        {
            if (roleMap.TryGetValue(pair.RoleId, out var rName) && !userSupervisorRoleMap.ContainsKey(pair.UserId))
            {
                userSupervisorRoleMap[pair.UserId] = rName;
            }
        }

        var eligibleUserIds = userSupervisorRoleMap.Keys.ToList();

        var supervisors = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.IsActive && e.UserId != null && eligibleUserIds.Contains(e.UserId))
            .OrderBy(e => e.FirstName)
            .ThenBy(e => e.LastName)
            .ToListAsync(cancellationToken);

        var dtos = supervisors.Select(s => new SupervisorLookupDto
        {
            Id = s.Id,
            EmployeeCode = s.EmployeeCode,
            FullName = s.FullName,
            Department = s.Department,
            JobTitle = s.JobTitle,
            Role = s.UserId != null && userSupervisorRoleMap.TryGetValue(s.UserId, out var r) ? r : null
        }).ToList();

        return GenericBaseResponse<List<SupervisorLookupDto>>.Success(dtos);
    }
}
