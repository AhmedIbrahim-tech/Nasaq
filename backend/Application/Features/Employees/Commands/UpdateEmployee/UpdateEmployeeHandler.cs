namespace Application.Features.Employees.Commands.UpdateEmployee;

public sealed class UpdateEmployeeHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser,
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager)
    : IRequestHandler<UpdateEmployeeCommand, GenericBaseResponse<EmployeeDto>>
{
    public async Task<GenericBaseResponse<EmployeeDto>> Handle(
        UpdateEmployeeCommand request,
        CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .Include(e => e.User)
            .Include(e => e.Supervisor)
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<EmployeeDto>.NotFound($"Employee with ID '{request.Id}' was not found.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var emailTaken = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.Email == normalizedEmail && e.Id != request.Id, cancellationToken);

        if (emailTaken)
        {
            return GenericBaseResponse<EmployeeDto>.Conflict($"Email address '{normalizedEmail}' is already used by another employee.");
        }

        // Prevent privilege escalation: non-SuperAdmin cannot assign SuperAdmin role
        var requestedRole = request.UserRole?.Trim();
        if (!string.IsNullOrWhiteSpace(requestedRole))
        {
            if (!RoleNames.All.Contains(requestedRole, StringComparer.OrdinalIgnoreCase))
            {
                return GenericBaseResponse<EmployeeDto>.Fail($"Invalid role '{requestedRole}'. Allowed roles: {string.Join(", ", RoleNames.All)}.");
            }

            if (string.Equals(requestedRole, RoleNames.SuperAdmin, StringComparison.OrdinalIgnoreCase) && !currentUser.IsSuperAdmin)
            {
                return GenericBaseResponse<EmployeeDto>.Fail(
                    "Privilege escalation prevented: Only SuperAdmin can assign the SuperAdmin role.",
                    HttpStatusCode.Forbidden);
            }
        }

        string? assignedRole = null;

        if (employee.UserId != null)
        {
            var user = await userManager.FindByIdAsync(employee.UserId);
            if (user != null)
            {
                var currentRoles = await userManager.GetRolesAsync(user);

                // Prevent privilege escalation: non-SuperAdmin cannot modify a SuperAdmin account
                if (currentRoles.Contains(RoleNames.SuperAdmin, StringComparer.OrdinalIgnoreCase) && !currentUser.IsSuperAdmin)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail(
                        "Permission denied: Only SuperAdmin can modify an account with SuperAdmin role.",
                        HttpStatusCode.Forbidden);
                }

                user.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
                user.JobTitle = request.JobTitle?.Trim();
                user.Department = request.Department?.Trim();

                if (!string.Equals(user.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
                {
                    var emailOwner = await userManager.FindByEmailAsync(normalizedEmail);
                    if (emailOwner != null && emailOwner.Id != user.Id)
                    {
                        return GenericBaseResponse<EmployeeDto>.Conflict($"User account with email '{normalizedEmail}' already exists.");
                    }
                    user.Email = normalizedEmail;
                    user.UserName = normalizedEmail;
                }

                await userManager.UpdateAsync(user);

                if (!string.IsNullOrWhiteSpace(requestedRole))
                {
                    await userManager.RemoveFromRolesAsync(user, currentRoles);
                    if (await roleManager.RoleExistsAsync(requestedRole))
                    {
                        await userManager.AddToRoleAsync(user, requestedRole);
                    }
                    assignedRole = requestedRole;
                }
                else
                {
                    assignedRole = currentRoles.FirstOrDefault();
                }
            }
        }
        else if (!string.IsNullOrWhiteSpace(request.UserId))
        {
            var existingUser = await userManager.FindByIdAsync(request.UserId.Trim());
            if (existingUser == null)
            {
                return GenericBaseResponse<EmployeeDto>.NotFound($"User account with ID '{request.UserId}' was not found.");
            }

            var userAlreadyLinked = await dbContext.Employees
                .AsNoTracking()
                .AnyAsync(e => e.UserId == existingUser.Id && e.Id != request.Id, cancellationToken);

            if (userAlreadyLinked)
            {
                return GenericBaseResponse<EmployeeDto>.Conflict("The specified user account is already linked to another employee.");
            }

            employee.UserId = existingUser.Id;

            if (!string.IsNullOrWhiteSpace(requestedRole))
            {
                var currentRoles = await userManager.GetRolesAsync(existingUser);
                await userManager.RemoveFromRolesAsync(existingUser, currentRoles);
                if (await roleManager.RoleExistsAsync(requestedRole))
                {
                    await userManager.AddToRoleAsync(existingUser, requestedRole);
                }
                assignedRole = requestedRole;
            }
            else
            {
                var currentRoles = await userManager.GetRolesAsync(existingUser);
                assignedRole = currentRoles.FirstOrDefault();
            }
        }

        string? supervisorName = employee.Supervisor?.FullName;
        string? supervisorCode = employee.Supervisor?.EmployeeCode;

        if (request.SupervisorId != employee.SupervisorId)
        {
            if (!currentUser.IsSuperAdmin && !currentUser.IsAdmin)
            {
                return GenericBaseResponse<EmployeeDto>.Fail(
                    "Only SuperAdmin and Admin can assign or change an employee's supervisor.",
                    HttpStatusCode.Forbidden);
            }

            if (request.SupervisorId.HasValue)
            {
                // Prevent self-supervision
                if (request.SupervisorId.Value == employee.Id)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail(
                        "An employee cannot be assigned as their own supervisor.",
                        HttpStatusCode.BadRequest);
                }

                var supervisor = await dbContext.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.Id == request.SupervisorId.Value, cancellationToken);

                if (supervisor == null)
                {
                    return GenericBaseResponse<EmployeeDto>.NotFound("The selected supervisor was not found.");
                }

                if (!supervisor.IsActive)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail("Cannot assign an inactive employee as a supervisor.");
                }

                if (string.IsNullOrEmpty(supervisor.UserId))
                {
                    return GenericBaseResponse<EmployeeDto>.Fail("The selected supervisor does not have an active user account.");
                }

                var supervisorUser = await userManager.FindByIdAsync(supervisor.UserId);
                if (supervisorUser == null)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail("The selected supervisor user account was not found.");
                }

                var supRoles = await userManager.GetRolesAsync(supervisorUser);
                if (!supRoles.Any(r => r is RoleNames.Supervisor or RoleNames.Admin or RoleNames.SuperAdmin))
                {
                    return GenericBaseResponse<EmployeeDto>.Fail("The selected employee does not have a supervisor or administrative role.");
                }

                employee.SupervisorId = request.SupervisorId;
                supervisorName = supervisor.FullName;
                supervisorCode = supervisor.EmployeeCode;
            }
            else
            {
                employee.SupervisorId = null;
                supervisorName = null;
                supervisorCode = null;
            }
        }

        employee.FirstName = request.FirstName.Trim();
        employee.LastName = request.LastName.Trim();
        employee.Email = normalizedEmail;
        employee.PhoneNumber = request.PhoneNumber?.Trim();
        employee.Department = request.Department?.Trim();
        employee.JobTitle = request.JobTitle?.Trim();
        employee.HireDate = request.HireDate;

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
            UserRole = assignedRole,
            SupervisorId = employee.SupervisorId,
            SupervisorName = supervisorName,
            SupervisorCode = supervisorCode,
            Created_Utc = employee.Created_Utc,
            Created_By = employee.Created_By,
            Updated_Utc = employee.Updated_Utc,
            Updated_By = employee.Updated_By
        };

        return GenericBaseResponse<EmployeeDto>.Success(dto, "Employee updated successfully.");
    }
}
