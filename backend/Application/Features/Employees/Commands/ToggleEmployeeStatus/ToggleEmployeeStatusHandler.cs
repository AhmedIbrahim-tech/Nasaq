namespace Application.Features.Employees.Commands.ToggleEmployeeStatus;

public sealed class ToggleEmployeeStatusHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<ToggleEmployeeStatusCommand, GenericBaseResponse<EmployeeDto>>
{
    public async Task<GenericBaseResponse<EmployeeDto>> Handle(
        ToggleEmployeeStatusCommand request,
        CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<EmployeeDto>.NotFound($"Employee with ID '{request.Id}' was not found.");
        }

        string? userRole = null;

        if (employee.UserId != null)
        {
            var user = await userManager.FindByIdAsync(employee.UserId);
            if (user != null)
            {
                var roles = await userManager.GetRolesAsync(user);
                userRole = roles.FirstOrDefault();

                // Prevent privilege escalation: non-SuperAdmin cannot modify a SuperAdmin account
                if (roles.Contains(RoleNames.SuperAdmin, StringComparer.OrdinalIgnoreCase) && !currentUser.IsSuperAdmin)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail(
                        "Permission denied: Only SuperAdmin can modify status of a SuperAdmin account.",
                        HttpStatusCode.Forbidden);
                }

                var newStatus = request.IsActive ?? !employee.IsActive;
                user.IsActive = newStatus;
                await userManager.UpdateAsync(user);
            }
        }

        employee.IsActive = request.IsActive ?? !employee.IsActive;
        await dbContext.SaveChangesAsync(cancellationToken);

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
            Created_Utc = employee.Created_Utc,
            Created_By = employee.Created_By,
            Updated_Utc = employee.Updated_Utc,
            Updated_By = employee.Updated_By
        };

        var message = employee.IsActive ? "Employee activated successfully." : "Employee deactivated successfully.";
        return GenericBaseResponse<EmployeeDto>.Success(dto, message);
    }
}
