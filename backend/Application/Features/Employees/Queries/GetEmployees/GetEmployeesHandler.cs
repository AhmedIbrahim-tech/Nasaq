namespace Application.Features.Employees.Queries.GetEmployees;

public sealed class GetEmployeesHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser)
    : IRequestHandler<GetEmployeesQuery, GenericBaseResponse<PaginationResult<EmployeeDto>>>
{
    public async Task<GenericBaseResponse<PaginationResult<EmployeeDto>>> Handle(
        GetEmployeesQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Employees.AsNoTracking().AsQueryable();

        // Supervisors can view only directly assigned staff
        if (currentUser.IsSupervisor && !currentUser.IsSuperAdmin && !currentUser.IsAdmin)
        {
            if (string.IsNullOrEmpty(currentUser.UserId))
            {
                var emptyResult = PaginationResult<EmployeeDto>.Success(new List<EmployeeDto>(), 0, request.Page, request.PageSize);
                return GenericBaseResponse<PaginationResult<EmployeeDto>>.Success(emptyResult);
            }

            var currentSupervisor = await dbContext.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == currentUser.UserId, cancellationToken);

            if (currentSupervisor == null)
            {
                var emptyResult = PaginationResult<EmployeeDto>.Success(new List<EmployeeDto>(), 0, request.Page, request.PageSize);
                return GenericBaseResponse<PaginationResult<EmployeeDto>>.Success(emptyResult);
            }

            query = query.Where(e => e.SupervisorId == currentSupervisor.Id);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(e =>
                e.EmployeeCode.ToLower().Contains(search) ||
                e.FirstName.ToLower().Contains(search) ||
                e.LastName.ToLower().Contains(search) ||
                e.Email.ToLower().Contains(search) ||
                (e.Department != null && e.Department.ToLower().Contains(search)) ||
                (e.JobTitle != null && e.JobTitle.ToLower().Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(request.Department))
        {
            var dept = request.Department.Trim().ToLower();
            query = query.Where(e => e.Department != null && e.Department.ToLower() == dept);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(e => e.IsActive == request.IsActive.Value);
        }

        query = request.SortBy?.ToLower() switch
        {
            "employeecode" => request.SortDescending ? query.OrderByDescending(e => e.EmployeeCode) : query.OrderBy(e => e.EmployeeCode),
            "firstname" => request.SortDescending ? query.OrderByDescending(e => e.FirstName) : query.OrderBy(e => e.FirstName),
            "lastname" => request.SortDescending ? query.OrderByDescending(e => e.LastName) : query.OrderBy(e => e.LastName),
            "email" => request.SortDescending ? query.OrderByDescending(e => e.Email) : query.OrderBy(e => e.Email),
            "department" => request.SortDescending ? query.OrderByDescending(e => e.Department) : query.OrderBy(e => e.Department),
            "hiredate" => request.SortDescending ? query.OrderByDescending(e => e.HireDate) : query.OrderBy(e => e.HireDate),
            "isactive" => request.SortDescending ? query.OrderByDescending(e => e.IsActive) : query.OrderBy(e => e.IsActive),
            _ => request.SortDescending ? query.OrderByDescending(e => e.Created_Utc) : query.OrderByDescending(e => e.Created_Utc)
        };

        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var totalCount = await query.CountAsync(cancellationToken);

        long skip = (long)(page - 1) * pageSize;
        if (skip >= totalCount || skip > int.MaxValue)
        {
            var emptyResult = PaginationResult<EmployeeDto>.Success(new List<EmployeeDto>(), totalCount, page, pageSize);
            return GenericBaseResponse<PaginationResult<EmployeeDto>>.Success(emptyResult);
        }

        var employees = await query
            .Include(e => e.Supervisor)
            .Skip((int)skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var userIds = employees.Where(e => !string.IsNullOrEmpty(e.UserId)).Select(e => e.UserId!).Distinct().ToList();
        var userRoleMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        if (userIds.Count > 0)
        {
            var userRolesQuery = from ur in dbContext.UserRoles.AsNoTracking()
                                 join r in dbContext.Roles.AsNoTracking() on ur.RoleId equals r.Id
                                 where userIds.Contains(ur.UserId)
                                 select new { ur.UserId, RoleName = r.Name };

            var rolePairs = await userRolesQuery.ToListAsync(cancellationToken);
            foreach (var pair in rolePairs)
            {
                if (!string.IsNullOrEmpty(pair.RoleName) && !userRoleMap.ContainsKey(pair.UserId))
                {
                    userRoleMap[pair.UserId] = pair.RoleName;
                }
            }
        }

        var dtos = employees.Select(e => new EmployeeDto
        {
            Id = e.Id,
            EmployeeCode = e.EmployeeCode,
            FirstName = e.FirstName,
            LastName = e.LastName,
            FullName = e.FullName,
            Email = e.Email,
            PhoneNumber = e.PhoneNumber,
            Department = e.Department,
            JobTitle = e.JobTitle,
            HireDate = e.HireDate,
            IsActive = e.IsActive,
            UserId = e.UserId,
            UserRole = e.UserId != null && userRoleMap.TryGetValue(e.UserId, out var role) ? role : null,
            SupervisorId = e.SupervisorId,
            SupervisorName = e.Supervisor != null ? e.Supervisor.FullName : null,
            SupervisorCode = e.Supervisor != null ? e.Supervisor.EmployeeCode : null,
            Created_Utc = e.Created_Utc,
            Created_By = e.Created_By,
            Updated_Utc = e.Updated_Utc,
            Updated_By = e.Updated_By
        }).ToList();

        var paginatedResult = PaginationResult<EmployeeDto>.Success(dtos, totalCount, page, pageSize);
        return GenericBaseResponse<PaginationResult<EmployeeDto>>.Success(paginatedResult);
    }
}
