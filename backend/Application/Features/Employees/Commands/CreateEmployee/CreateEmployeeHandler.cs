namespace Application.Features.Employees.Commands.CreateEmployee;

public sealed class CreateEmployeeHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork,
    IFileService fileService,
    ICurrentUser currentUser,
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    ITemporaryPasswordService passwordService,
    ILogger<CreateEmployeeHandler>? logger = null)
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

        var requestedRole = request.UserRole?.Trim();
        var firstNameAr = !string.IsNullOrWhiteSpace(request.FirstNameAr) ? request.FirstNameAr.Trim() : null;
        var lastNameAr = !string.IsNullOrWhiteSpace(request.LastNameAr) ? request.LastNameAr.Trim() : null;
        var firstName = !string.IsNullOrWhiteSpace(request.FirstNameEn)
            ? request.FirstNameEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.FirstName) ? request.FirstName.Trim() : (firstNameAr ?? string.Empty));
        var lastName = !string.IsNullOrWhiteSpace(request.LastNameEn)
            ? request.LastNameEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.LastName) ? request.LastName.Trim() : (lastNameAr ?? string.Empty));
        var department = request.Department?.Trim();
        var departmentAr = request.DepartmentAr?.Trim();
        var jobTitle = request.JobTitle?.Trim();
        var jobTitleAr = request.JobTitleAr?.Trim();
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

        string? supervisorName = null;
        string? supervisorCode = null;

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
        }

        string? linkedUserId = null;
        string? assignedRole = null;
        StoredFile? storedFile = null;
        var commitAttempted = false;
        var committed = false;

        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            if (request.CreateUserAccount)
            {
                var roleToAssign = !string.IsNullOrWhiteSpace(requestedRole) ? requestedRole : RoleNames.Employee;

                var newUser = new ApplicationUser
                {
                    UserName = normalizedEmail,
                    Email = normalizedEmail,
                    FullName = $"{firstName} {lastName}".Trim(),
                    FullNameAr = !string.IsNullOrWhiteSpace(firstNameAr) || !string.IsNullOrWhiteSpace(lastNameAr)
                        ? $"{firstNameAr} {lastNameAr}".Trim()
                        : null,
                    JobTitle = jobTitle,
                    JobTitleAr = jobTitleAr,
                    Department = department,
                    DepartmentAr = departmentAr,
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
                    await unitOfWork.RollbackAsync();
                    var errors = createResult.Errors.Select(e => e.Description).ToList();
                    return GenericBaseResponse<EmployeeDto>.Fail(
                        "Failed to create user account: " + string.Join("; ", errors),
                        errors: errors);
                }

                if (await roleManager.RoleExistsAsync(roleToAssign))
                {
                    var roleResult = await userManager.AddToRoleAsync(newUser, roleToAssign);
                    if (!roleResult.Succeeded)
                    {
                        await unitOfWork.RollbackAsync();
                        var errors = roleResult.Errors.Select(e => e.Description).ToList();
                        return GenericBaseResponse<EmployeeDto>.Fail(
                            "Failed to assign role to user account: " + string.Join("; ", errors),
                            errors: errors);
                    }
                }

                linkedUserId = newUser.Id;
                assignedRole = roleToAssign;
            }
            else if (!string.IsNullOrWhiteSpace(request.UserId))
            {
                var existingUser = await userManager.FindByIdAsync(request.UserId.Trim());
                if (existingUser == null)
                {
                    await unitOfWork.RollbackAsync();
                    return GenericBaseResponse<EmployeeDto>.NotFound($"User account with ID '{request.UserId}' was not found.");
                }

                if (!string.IsNullOrWhiteSpace(requestedRole))
                {
                    var currentRoles = await userManager.GetRolesAsync(existingUser);
                    if (!currentRoles.Contains(requestedRole, StringComparer.OrdinalIgnoreCase))
                    {
                        if (await roleManager.RoleExistsAsync(requestedRole))
                        {
                            var addRoleResult = await userManager.AddToRoleAsync(existingUser, requestedRole);
                            if (!addRoleResult.Succeeded)
                            {
                                await unitOfWork.RollbackAsync();
                                var errors = addRoleResult.Errors.Select(e => e.Description).ToList();
                                return GenericBaseResponse<EmployeeDto>.Fail(
                                    "Failed to assign requested role to existing user account: " + string.Join("; ", errors),
                                    errors: errors);
                            }
                        }
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

            string? workLocationName = null;
            if (request.WorkLocationId.HasValue)
            {
                var location = await dbContext.WorkLocations
                    .AsNoTracking()
                    .FirstOrDefaultAsync(w => w.Id == request.WorkLocationId.Value, cancellationToken);

                if (location == null)
                {
                    await unitOfWork.RollbackAsync();
                    return GenericBaseResponse<EmployeeDto>.NotFound("The selected work location was not found.");
                }

                if (!location.IsActive)
                {
                    await unitOfWork.RollbackAsync();
                    return GenericBaseResponse<EmployeeDto>.Fail("Cannot assign an inactive work location to an employee.");
                }

                workLocationName = location.Name;
            }

            var employeeId = Guid.NewGuid();
            var employee = new Employee
            {
                Id = employeeId,
                EmployeeCode = normalizedCode,
                FirstName = firstName,
                LastName = lastName,
                FirstNameAr = firstNameAr,
                LastNameAr = lastNameAr,
                Email = normalizedEmail,
                PhoneNumber = request.PhoneNumber?.Trim(),
                Department = department,
                DepartmentAr = departmentAr,
                JobTitle = jobTitle,
                JobTitleAr = jobTitleAr,
                HireDate = request.HireDate,
                IsActive = true,
                UserId = linkedUserId,
                SupervisorId = request.SupervisorId,
                WorkLocationId = request.WorkLocationId,
                ProfilePhoto = null
            };

            await dbContext.Employees.AddAsync(employee, cancellationToken);

            if (request.ProfilePhoto is not null)
            {
                storedFile = await fileService.SaveAsync(
                    request.ProfilePhoto,
                    FileCategory.Employees,
                    employeeId,
                    cancellationToken);

                employee.ProfilePhoto = storedFile.Id;
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            commitAttempted = true;
            await unitOfWork.CommitAsync();
            committed = true;

            var dto = new EmployeeDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                FirstNameAr = employee.FirstNameAr,
                LastNameAr = employee.LastNameAr,
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
                UserRole = assignedRole,
                SupervisorId = employee.SupervisorId,
                SupervisorName = supervisorName,
                SupervisorCode = supervisorCode,
                WorkLocationId = employee.WorkLocationId,
                WorkLocationName = workLocationName,
                ProfilePhoto = employee.ProfilePhoto,
                Created_Utc = employee.Created_Utc,
                Created_By = employee.Created_By,
                Updated_Utc = employee.Updated_Utc,
                Updated_By = employee.Updated_By
            };

            return GenericBaseResponse<EmployeeDto>.Created(dto, "Employee created successfully.");
        }
        catch (Exception ex)
        {
            var rollbackSucceeded = false;

            if (!committed)
            {
                try
                {
                    await unitOfWork.RollbackAsync();
                    rollbackSucceeded = true;
                }
                catch (Exception rollbackEx)
                {
                    logger?.LogError(rollbackEx, "Failed to roll back database transaction during employee creation. Database state cannot be confirmed.");
                }
            }

            if (storedFile?.RelativePath != null)
            {
                if (!commitAttempted && rollbackSucceeded)
                {
                    try
                    {
                        await fileService.DeleteAsync(storedFile.RelativePath, CancellationToken.None);
                    }
                    catch (Exception deleteEx)
                    {
                        logger?.LogWarning(deleteEx, "Failed to clean up physical file '{Path}' after employee creation rollback.", storedFile.RelativePath);
                    }
                }
                else if (commitAttempted && !committed)
                {
                    logger?.LogError(ex, "Transaction commit outcome is uncertain for employee creation. Preserving physical file '{Path}' to prevent deleting referenced files.", storedFile.RelativePath);
                }
            }

            if (ex is InvalidOperationException or ArgumentException)
            {
                return GenericBaseResponse<EmployeeDto>.Fail(ex.Message, HttpStatusCode.BadRequest);
            }

            throw;
        }
    }
}
