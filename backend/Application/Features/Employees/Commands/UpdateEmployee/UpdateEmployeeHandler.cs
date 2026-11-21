namespace Application.Features.Employees.Commands.UpdateEmployee;

public sealed class UpdateEmployeeHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork,
    IFileService fileService,
    ICurrentUser currentUser,
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    ILogger<UpdateEmployeeHandler>? logger = null)
    : IRequestHandler<UpdateEmployeeCommand, GenericBaseResponse<EmployeeDto>>
{
    public async Task<GenericBaseResponse<EmployeeDto>> Handle(
        UpdateEmployeeCommand request,
        CancellationToken cancellationToken)
    {
        if (request.ProfilePhoto != null && request.RemoveProfilePhoto)
        {
            return GenericBaseResponse<EmployeeDto>.Fail(
                "Cannot upload a new profile photo and request removal at the same time.",
                HttpStatusCode.BadRequest);
        }

        var employee = await dbContext.Employees
            .Include(e => e.User)
            .Include(e => e.Supervisor)
            .Include(e => e.WorkLocation)
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

        ApplicationUser? linkedUser = null;
        ApplicationUser? newExistingUser = null;

        if (employee.UserId != null)
        {
            linkedUser = await userManager.FindByIdAsync(employee.UserId);
            if (linkedUser != null)
            {
                var userRoles = await userManager.GetRolesAsync(linkedUser);

                if (userRoles.Contains(RoleNames.SuperAdmin, StringComparer.OrdinalIgnoreCase) && !currentUser.IsSuperAdmin)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail(
                        "Permission denied: Only SuperAdmin can modify an account with SuperAdmin role.",
                        HttpStatusCode.Forbidden);
                }

                if (!string.Equals(linkedUser.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
                {
                    var emailOwner = await userManager.FindByEmailAsync(normalizedEmail);
                    if (emailOwner != null && emailOwner.Id != linkedUser.Id)
                    {
                        return GenericBaseResponse<EmployeeDto>.Conflict($"User account with email '{normalizedEmail}' already exists.");
                    }
                }
            }
        }
        else if (!string.IsNullOrWhiteSpace(request.UserId))
        {
            newExistingUser = await userManager.FindByIdAsync(request.UserId.Trim());
            if (newExistingUser == null)
            {
                return GenericBaseResponse<EmployeeDto>.NotFound($"User account with ID '{request.UserId}' was not found.");
            }

            var userAlreadyLinked = await dbContext.Employees
                .AsNoTracking()
                .AnyAsync(e => e.UserId == newExistingUser.Id && e.Id != request.Id, cancellationToken);

            if (userAlreadyLinked)
            {
                return GenericBaseResponse<EmployeeDto>.Conflict("The specified user account is already linked to another employee.");
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

                supervisorName = supervisor.FullName;
                supervisorCode = supervisor.EmployeeCode;
            }
            else
            {
                supervisorName = null;
                supervisorCode = null;
            }
        }

        string? workLocationName = employee.WorkLocation?.Name;
        if (request.WorkLocationId != employee.WorkLocationId)
        {
            if (request.WorkLocationId.HasValue)
            {
                var location = await dbContext.WorkLocations
                    .AsNoTracking()
                    .FirstOrDefaultAsync(w => w.Id == request.WorkLocationId.Value, cancellationToken);

                if (location == null)
                {
                    return GenericBaseResponse<EmployeeDto>.NotFound("The selected work location was not found.");
                }

                if (!location.IsActive)
                {
                    return GenericBaseResponse<EmployeeDto>.Fail("Cannot assign an inactive work location to an employee.");
                }

                workLocationName = location.Name;
            }
            else
            {
                workLocationName = null;
            }
        }

        string? assignedRole = null;
        string? newCommittedPath = null;
        string? oldPhysicalPathToDelete = null;
        var commitAttempted = false;
        var committed = false;

        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            if (linkedUser != null)
            {
                var currentRoles = (await userManager.GetRolesAsync(linkedUser)).ToList();

                linkedUser.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
                linkedUser.JobTitle = request.JobTitle?.Trim();
                linkedUser.Department = request.Department?.Trim();

                if (!string.Equals(linkedUser.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
                {
                    linkedUser.Email = normalizedEmail;
                    linkedUser.UserName = normalizedEmail;
                }

                var updateResult = await userManager.UpdateAsync(linkedUser);
                if (!updateResult.Succeeded)
                {
                    await unitOfWork.RollbackAsync();
                    var errors = updateResult.Errors.Select(e => e.Description).ToList();
                    return GenericBaseResponse<EmployeeDto>.Fail(
                        "Failed to update user account: " + string.Join("; ", errors),
                        errors: errors);
                }

                if (!string.IsNullOrWhiteSpace(requestedRole))
                {
                    if (!currentRoles.Contains(requestedRole, StringComparer.OrdinalIgnoreCase))
                    {
                        if (currentRoles.Count > 0)
                        {
                            var removeResult = await userManager.RemoveFromRolesAsync(linkedUser, currentRoles);
                            if (!removeResult.Succeeded)
                            {
                                await unitOfWork.RollbackAsync();
                                var errors = removeResult.Errors.Select(e => e.Description).ToList();
                                return GenericBaseResponse<EmployeeDto>.Fail(
                                    "Failed to update user roles: " + string.Join("; ", errors),
                                    errors: errors);
                            }
                        }

                        if (await roleManager.RoleExistsAsync(requestedRole))
                        {
                            var addResult = await userManager.AddToRoleAsync(linkedUser, requestedRole);
                            if (!addResult.Succeeded)
                            {
                                await unitOfWork.RollbackAsync();
                                var errors = addResult.Errors.Select(e => e.Description).ToList();
                                return GenericBaseResponse<EmployeeDto>.Fail(
                                    "Failed to assign role to user account: " + string.Join("; ", errors),
                                    errors: errors);
                            }
                        }
                    }
                    assignedRole = requestedRole;
                }
                else
                {
                    assignedRole = currentRoles.FirstOrDefault();
                }
            }
            else if (newExistingUser != null)
            {
                var currentRoles = (await userManager.GetRolesAsync(newExistingUser)).ToList();

                employee.UserId = newExistingUser.Id;

                if (!string.IsNullOrWhiteSpace(requestedRole))
                {
                    if (!currentRoles.Contains(requestedRole, StringComparer.OrdinalIgnoreCase))
                    {
                        if (currentRoles.Count > 0)
                        {
                            var removeResult = await userManager.RemoveFromRolesAsync(newExistingUser, currentRoles);
                            if (!removeResult.Succeeded)
                            {
                                await unitOfWork.RollbackAsync();
                                var errors = removeResult.Errors.Select(e => e.Description).ToList();
                                return GenericBaseResponse<EmployeeDto>.Fail(
                                    "Failed to update user roles: " + string.Join("; ", errors),
                                    errors: errors);
                            }
                        }

                        if (await roleManager.RoleExistsAsync(requestedRole))
                        {
                            var addResult = await userManager.AddToRoleAsync(newExistingUser, requestedRole);
                            if (!addResult.Succeeded)
                            {
                                await unitOfWork.RollbackAsync();
                                var errors = addResult.Errors.Select(e => e.Description).ToList();
                                return GenericBaseResponse<EmployeeDto>.Fail(
                                    "Failed to assign role to user account: " + string.Join("; ", errors),
                                    errors: errors);
                            }
                        }
                    }
                    assignedRole = requestedRole;
                }
                else
                {
                    assignedRole = currentRoles.FirstOrDefault();
                }
            }

            employee.SupervisorId = request.SupervisorId;
            employee.WorkLocationId = request.WorkLocationId;

            if (request.RemoveProfilePhoto)
            {
                if (employee.ProfilePhoto.HasValue)
                {
                    var oldStoredFile = await dbContext.StoredFiles
                        .FirstOrDefaultAsync(f => f.Id == employee.ProfilePhoto.Value, cancellationToken);
                    if (oldStoredFile != null)
                    {
                        oldPhysicalPathToDelete = oldStoredFile.RelativePath;
                        dbContext.StoredFiles.Remove(oldStoredFile);
                    }
                    employee.ProfilePhoto = null;
                }
            }
            else if (request.ProfilePhoto != null)
            {
                if (employee.ProfilePhoto.HasValue)
                {
                    var oldStoredFile = await dbContext.StoredFiles
                        .FirstOrDefaultAsync(f => f.Id == employee.ProfilePhoto.Value, cancellationToken);
                    if (oldStoredFile != null)
                    {
                        oldPhysicalPathToDelete = oldStoredFile.RelativePath;
                        dbContext.StoredFiles.Remove(oldStoredFile);
                    }
                }

                var newStoredFile = await fileService.SaveAsync(
                    request.ProfilePhoto,
                    FileCategory.Employees,
                    employee.Id,
                    cancellationToken);

                newCommittedPath = newStoredFile.RelativePath;
                employee.ProfilePhoto = newStoredFile.Id;
            }

            if (!string.IsNullOrWhiteSpace(request.FirstNameEn))
            {
                employee.FirstName = request.FirstNameEn.Trim();
            }
            else if (!string.IsNullOrWhiteSpace(request.FirstName))
            {
                employee.FirstName = request.FirstName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.LastNameEn))
            {
                employee.LastName = request.LastNameEn.Trim();
            }
            else if (!string.IsNullOrWhiteSpace(request.LastName))
            {
                employee.LastName = request.LastName.Trim();
            }

            if (request.FirstNameAr != null)
            {
                employee.FirstNameAr = string.IsNullOrWhiteSpace(request.FirstNameAr) ? null : request.FirstNameAr.Trim();
            }

            if (request.LastNameAr != null)
            {
                employee.LastNameAr = string.IsNullOrWhiteSpace(request.LastNameAr) ? null : request.LastNameAr.Trim();
            }

            employee.Email = normalizedEmail;
            employee.PhoneNumber = request.PhoneNumber?.Trim();

            if (request.Department != null)
            {
                employee.Department = string.IsNullOrWhiteSpace(request.Department) ? null : request.Department.Trim();
            }
            if (request.DepartmentAr != null)
            {
                employee.DepartmentAr = string.IsNullOrWhiteSpace(request.DepartmentAr) ? null : request.DepartmentAr.Trim();
            }

            if (request.JobTitle != null)
            {
                employee.JobTitle = string.IsNullOrWhiteSpace(request.JobTitle) ? null : request.JobTitle.Trim();
            }
            if (request.JobTitleAr != null)
            {
                employee.JobTitleAr = string.IsNullOrWhiteSpace(request.JobTitleAr) ? null : request.JobTitleAr.Trim();
            }

            employee.HireDate = request.HireDate;

            if (linkedUser != null)
            {
                linkedUser.FullName = employee.FullName;
                linkedUser.FullNameAr = employee.FullNameAr;
                linkedUser.JobTitle = employee.JobTitle;
                linkedUser.JobTitleAr = employee.JobTitleAr;
                linkedUser.Department = employee.Department;
                linkedUser.DepartmentAr = employee.DepartmentAr;
                await userManager.UpdateAsync(linkedUser);
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            commitAttempted = true;
            await unitOfWork.CommitAsync();
            committed = true;

            if (oldPhysicalPathToDelete != null)
            {
                try
                {
                    await fileService.DeleteAsync(oldPhysicalPathToDelete, CancellationToken.None);
                }
                catch (Exception delEx)
                {
                    logger?.LogWarning(delEx, "Failed to delete old physical file '{Path}' after employee photo update.", oldPhysicalPathToDelete);
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

            return GenericBaseResponse<EmployeeDto>.Success(dto, "Employee updated successfully.");
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
                    logger?.LogError(rollbackEx, "Failed to roll back database transaction during employee update. Database state cannot be confirmed.");
                }
            }

            if (newCommittedPath != null)
            {
                if (!commitAttempted && rollbackSucceeded)
                {
                    try
                    {
                        await fileService.DeleteAsync(newCommittedPath, CancellationToken.None);
                    }
                    catch (Exception delEx)
                    {
                        logger?.LogWarning(delEx, "Failed to clean up new physical file '{Path}' during employee update rollback.", newCommittedPath);
                    }
                }
                else if (commitAttempted && !committed)
                {
                    logger?.LogError(ex, "Transaction commit outcome is uncertain for employee update. Preserving physical file '{Path}' to prevent deleting referenced files.", newCommittedPath);
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
