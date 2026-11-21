namespace Application.Features.Employees.Queries.GetCurrentEmployeeProfile;

public sealed class GetCurrentEmployeeProfileHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<GetCurrentEmployeeProfileQuery, GenericBaseResponse<EmployeeDto>>
{
    public async Task<GenericBaseResponse<EmployeeDto>> Handle(
        GetCurrentEmployeeProfileQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(currentUser.UserId))
        {
            return GenericBaseResponse<EmployeeDto>.Unauthorized("User session is unauthenticated or invalid.");
        }

        var employee = await dbContext.Employees
            .AsNoTracking()
            .Include(e => e.Supervisor)
            .Include(e => e.WorkLocation)
            .FirstOrDefaultAsync(e => e.UserId == currentUser.UserId, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<EmployeeDto>.NotFound("No employee profile is currently linked to your user account.");
        }

        string? userRole = null;
        var user = await userManager.FindByIdAsync(currentUser.UserId);
        if (user != null)
        {
            var roles = await userManager.GetRolesAsync(user);
            userRole = roles.FirstOrDefault();
        }

        var dto = new EmployeeDto
        {
            Id = employee.Id,
            EmployeeCode = employee.EmployeeCode,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            FullName = employee.FullName,
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber,
            Department = employee.Department,
            JobTitle = employee.JobTitle,
            HireDate = employee.HireDate,
            IsActive = employee.IsActive,
            UserId = employee.UserId,
            UserRole = userRole,
            SupervisorId = employee.SupervisorId,
            SupervisorName = employee.Supervisor?.FullName,
            SupervisorCode = employee.Supervisor?.EmployeeCode,
            WorkLocationId = employee.WorkLocationId,
            WorkLocationName = employee.WorkLocation?.Name,
            ProfilePhoto = employee.ProfilePhoto,
            Created_Utc = employee.Created_Utc,
            Created_By = employee.Created_By,
            Updated_Utc = employee.Updated_Utc,
            Updated_By = employee.Updated_By
        };

        return GenericBaseResponse<EmployeeDto>.Success(dto);
    }
}
