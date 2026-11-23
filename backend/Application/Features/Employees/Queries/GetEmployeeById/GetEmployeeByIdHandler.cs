namespace Application.Features.Employees.Queries.GetEmployeeById;

public sealed class GetEmployeeByIdHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<GetEmployeeByIdQuery, GenericBaseResponse<EmployeeDto>>
{
    public async Task<GenericBaseResponse<EmployeeDto>> Handle(
        GetEmployeeByIdQuery request,
        CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .AsNoTracking()
            .Include(e => e.Supervisor)
            .Include(e => e.WorkLocation)
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<EmployeeDto>.NotFound($"Employee with ID '{request.Id}' was not found.");
        }

        // Scoped access: Admin views all, Supervisor views assigned staff, Employee views self only
        if (!currentUser.IsSuperAdmin && !currentUser.IsAdmin)
        {
            if (currentUser.IsSupervisor)
            {
                var currentSupervisor = await dbContext.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.UserId == currentUser.UserId, cancellationToken);

                if (currentSupervisor == null || employee.SupervisorId != currentSupervisor.Id)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail(
                        "Access denied: You can only view details of your directly assigned employees.",
                        HttpStatusCode.Forbidden);
                }
            }
            else
            {
                if (string.IsNullOrEmpty(currentUser.UserId) || employee.UserId != currentUser.UserId)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail(
                        "You do not have permission to view another employee's record.",
                        HttpStatusCode.Forbidden);
                }
            }
        }

        string? userRole = null;
        if (!string.IsNullOrEmpty(employee.UserId))
        {
            var user = await userManager.FindByIdAsync(employee.UserId);
            if (user != null)
            {
                var roles = await userManager.GetRolesAsync(user);
                userRole = roles.FirstOrDefault();
            }
        }

        var dto = new EmployeeDto
        {
            Id = employee.Id,
            EmployeeCode = employee.EmployeeCode,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            FirstNameAr = employee.FirstNameAr,
            LastNameAr = employee.LastNameAr,
            FirstNameEn = employee.FirstNameEn,
            LastNameEn = employee.LastNameEn,
            FullName = employee.FullName,
            FullNameAr = employee.FullNameAr,
            FullNameEn = employee.FullNameEn,
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber,
            Department = employee.Department,
            DepartmentAr = employee.DepartmentAr,
            JobTitle = employee.JobTitle,
            JobTitleAr = employee.JobTitleAr,
            HireDate = employee.HireDate,
            IsActive = employee.IsActive,
            UserId = employee.UserId,
            UserRole = userRole,
            SupervisorId = employee.SupervisorId,
            SupervisorName = employee.Supervisor?.FullName,
            SupervisorNameAr = employee.Supervisor?.FullNameAr,
            SupervisorNameEn = employee.Supervisor?.FullNameEn,
            SupervisorCode = employee.Supervisor?.EmployeeCode,
            WorkLocationId = employee.WorkLocationId,
            WorkLocationName = employee.WorkLocation?.Name,
            WorkLocationNameAr = employee.WorkLocation?.NameAr,
            WorkLocationNameEn = employee.WorkLocation?.NameEn,
            ProfilePhoto = employee.ProfilePhoto,
            Created_Utc = employee.Created_Utc,
            Created_By = employee.Created_By,
            Updated_Utc = employee.Updated_Utc,
            Updated_By = employee.Updated_By
        };

        return GenericBaseResponse<EmployeeDto>.Success(dto);
    }
}
