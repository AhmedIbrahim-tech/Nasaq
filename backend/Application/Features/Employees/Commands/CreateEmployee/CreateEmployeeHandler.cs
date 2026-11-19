namespace Application.Features.Employees.Commands.CreateEmployee;

public sealed class CreateEmployeeHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser,
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    ITemporaryPasswordService passwordService)
    : IRequestHandler<CreateEmployeeCommand, GenericBaseResponse<EmployeeDto>>
{
    public async Task<GenericBaseResponse<EmployeeDto>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var normalizedCode = request.EmployeeCode.Trim();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var codeExists = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.EmployeeCode == normalizedCode, cancellationToken);

        if (codeExists)
        {
            return GenericBaseResponse<EmployeeDto>.Conflict($"Employee code '{normalizedCode}' is already registered.");
        }

        var emailExists = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.Email == normalizedEmail, cancellationToken);

        if (emailExists)
        {
            return GenericBaseResponse<EmployeeDto>.Conflict($"Email address '{normalizedEmail}' is already in use by another employee.");
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

        string? linkedUserId = null;
        string? assignedRole = null;
        string? supervisorName = null;
        string? supervisorCode = null;

        // Only SuperAdmin and Admin can assign direct supervisors
        if (request.SupervisorId.HasValue)
        {
            if (!currentUser.IsSuperAdmin && !currentUser.IsAdmin)
            {
                return GenericBaseResponse<EmployeeDto>.Fail(
                    "Only SuperAdmin and Admin can assign or change an employee's supervisor.",
                    HttpStatusCode.Forbidden);
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

            supervisorName = supervisor.FullName;
            supervisorCode = supervisor.EmployeeCode;
        }

        if (request.CreateUserAccount)
        {
            var existingUser = await userManager.FindByEmailAsync(normalizedEmail);
            if (existingUser != null)
            {
                return GenericBaseResponse<EmployeeDto>.Conflict($"A user account with email '{normalizedEmail}' already exists.");
            }

            var roleToAssign = !string.IsNullOrWhiteSpace(requestedRole) ? requestedRole : RoleNames.Employee;

            var newUser = new ApplicationUser
            {
                UserName = normalizedEmail,
                Email = normalizedEmail,
                FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}",
                JobTitle = request.JobTitle?.Trim(),
                Department = request.Department?.Trim(),
                EmailConfirmed = true,
                IsActive = true,
                MustChangePasswordOnNextLogin = true
            };

            var initialPassword = !string.IsNullOrWhiteSpace(request.Password)
                ? request.Password
                : passwordService.GenerateTemporaryPassword();

            var createResult = await userManager.CreateAsync(newUser, initialPassword);
            if (!createResult.Succeeded)
            {
                var errors = createResult.Errors.Select(e => e.Description).ToList();
                return GenericBaseResponse<EmployeeDto>.Fail(
                    "Failed to create user account: " + string.Join("; ", errors),
                    errors: errors);
            }

            if (await roleManager.RoleExistsAsync(roleToAssign))
            {
                await userManager.AddToRoleAsync(newUser, roleToAssign);
            }

            linkedUserId = newUser.Id;
            assignedRole = roleToAssign;
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
                .AnyAsync(e => e.UserId == existingUser.Id, cancellationToken);

            if (userAlreadyLinked)
            {
                return GenericBaseResponse<EmployeeDto>.Conflict("The specified user account is already linked to another employee.");
            }

            if (!string.IsNullOrWhiteSpace(requestedRole))
            {
                var currentRoles = await userManager.GetRolesAsync(existingUser);
                if (!currentRoles.Contains(requestedRole, StringComparer.OrdinalIgnoreCase))
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

            linkedUserId = existingUser.Id;
        }

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = normalizedCode,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedEmail,
            PhoneNumber = request.PhoneNumber?.Trim(),
            Department = request.Department?.Trim(),
            JobTitle = request.JobTitle?.Trim(),
            HireDate = request.HireDate,
            IsActive = true,
            UserId = linkedUserId,
            SupervisorId = request.SupervisorId
        };

        await dbContext.Employees.AddAsync(employee, cancellationToken);
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

        return GenericBaseResponse<EmployeeDto>.Created(dto, "Employee created successfully.");
    }
}
