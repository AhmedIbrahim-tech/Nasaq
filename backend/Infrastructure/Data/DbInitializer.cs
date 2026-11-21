namespace Infrastructure.Data;

public sealed class DbInitializer(
    RoleManager<ApplicationRole> roleManager,
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext,
    IOptions<DefaultAdminOptions> options,
    ILogger<DbInitializer> logger,
    IConfiguration? configuration = null)
{
    private readonly DefaultAdminOptions _options = options.Value;

    public async Task SeedAsync()
    {
        var shouldSeed = _options.AutoSeed || (configuration?.GetValue<bool>("Database:SeedDataOnStartup", false) ?? false);
        if (!shouldSeed)
        {
            return;
        }

        logger.LogInformation("Starting NASAQ database initialization & data seeding...");

        await SeedRolesAsync();
        await SeedUsersAndEmployeesAsync();
        await SeedLocationsAsync();
        await SeedLeaveTypesAsync();

        logger.LogInformation("NASAQ database initialization & data seeding completed successfully.");
    }

    private async Task SeedRolesAsync()
    {
        string[] roles = [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor, RoleNames.Employee];

        foreach (var roleName in roles)
        {
            var role = await roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                role = new ApplicationRole
                {
                    Name = roleName,
                    NormalizedName = roleName.ToUpperInvariant()
                };

                var result = await roleManager.CreateAsync(role);
                if (!result.Succeeded)
                {
                    logger.LogError("Failed to seed role {Role}: {Errors}", roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                    continue;
                }

                logger.LogInformation("Seeded default role: {Role}", roleName);
            }

            // Sync expected permissions idempotently
            var existingClaims = await roleManager.GetClaimsAsync(role);
            var expectedPermissions = GetExpectedPermissionsForRole(roleName);

            foreach (var perm in expectedPermissions)
            {
                if (!existingClaims.Any(c => c.Type == "permission" && c.Value == perm))
                {
                    await roleManager.AddClaimAsync(role, new Claim("permission", perm));
                    logger.LogInformation("Added permission '{Permission}' to role '{Role}'", perm, roleName);
                }
            }
        }
    }

    private static List<string> GetExpectedPermissionsForRole(string roleName)
    {
        return roleName switch
        {
            RoleNames.SuperAdmin =>
            [
                Permissions.Users.View,
                Permissions.Users.Manage,
                Permissions.Roles.View,
                Permissions.Roles.Manage,
                Permissions.Employees.View,
                Permissions.Employees.Create,
                Permissions.Employees.Edit,
                Permissions.Employees.ToggleStatus,
                Permissions.Locations.View,
                Permissions.Locations.Create,
                Permissions.Locations.Edit,
                Permissions.Locations.ToggleStatus,
                Permissions.Leaves.View,
                Permissions.Leaves.ViewSelf,
                Permissions.Leaves.Submit,
                Permissions.Leaves.Cancel,
                Permissions.Leaves.Approve,
                Permissions.Leaves.ManageTypes
            ],
            RoleNames.Admin =>
            [
                Permissions.Employees.View,
                Permissions.Employees.Create,
                Permissions.Employees.Edit,
                Permissions.Employees.ToggleStatus,
                Permissions.Locations.View,
                Permissions.Locations.Create,
                Permissions.Locations.Edit,
                Permissions.Locations.ToggleStatus,
                Permissions.Leaves.View,
                Permissions.Leaves.ViewSelf,
                Permissions.Leaves.Submit,
                Permissions.Leaves.Cancel,
                Permissions.Leaves.Approve,
                Permissions.Leaves.ManageTypes
            ],
            RoleNames.Supervisor =>
            [
                Permissions.Employees.View,
                Permissions.Locations.View,
                Permissions.Leaves.View,
                Permissions.Leaves.ViewSelf,
                Permissions.Leaves.Submit,
                Permissions.Leaves.Cancel,
                Permissions.Leaves.Approve
            ],
            RoleNames.Employee =>
            [
                Permissions.Employees.ViewSelf,
                Permissions.Locations.View,
                Permissions.Leaves.ViewSelf,
                Permissions.Leaves.Submit,
                Permissions.Leaves.Cancel
            ],
            _ => []
        };
    }

    private async Task SeedUsersAndEmployeesAsync()
    {
        var defaultPassword = !string.IsNullOrWhiteSpace(_options.Password) ? _options.Password : "Admin@123456";

        var isSuperAdminConfigured = _options.Email?.Contains("superadmin", StringComparison.OrdinalIgnoreCase) == true
            || _options.FullName?.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

        var superAdminEmail = isSuperAdminConfigured && !string.IsNullOrWhiteSpace(_options.Email)
            ? _options.Email.Trim()
            : "superadmin@nasaq.local";

        var superAdminFullName = isSuperAdminConfigured && !string.IsNullOrWhiteSpace(_options.FullName)
            ? _options.FullName.Trim()
            : "System SuperAdmin";

        var superAdminJobTitle = isSuperAdminConfigured && !string.IsNullOrWhiteSpace(_options.JobTitle)
            ? _options.JobTitle.Trim()
            : "Chief Technology Officer";

        var superAdminDept = isSuperAdminConfigured && !string.IsNullOrWhiteSpace(_options.Department)
            ? _options.Department.Trim()
            : "Executive";

        var superAdminUser = await EnsureUserAsync(
            email: superAdminEmail,
            fullName: superAdminFullName,
            jobTitle: superAdminJobTitle,
            department: superAdminDept,
            roleName: RoleNames.SuperAdmin,
            password: defaultPassword);

        if (superAdminUser != null)
        {
            await EnsureEmployeeAsync(
                employeeCode: "EMP-SUPER01",
                firstName: "System",
                lastName: "SuperAdmin",
                email: superAdminEmail,
                jobTitle: superAdminJobTitle,
                department: superAdminDept,
                phoneNumber: "+201000000001",
                hireDate: new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                userId: superAdminUser.Id);
        }

        var adminEmail = !isSuperAdminConfigured && !string.IsNullOrWhiteSpace(_options.Email)
            ? _options.Email.Trim()
            : "admin@nasaq.local";

        var adminFullName = !isSuperAdminConfigured && !string.IsNullOrWhiteSpace(_options.FullName)
            ? _options.FullName.Trim()
            : "Operations Administrator";

        var adminJobTitle = !isSuperAdminConfigured && !string.IsNullOrWhiteSpace(_options.JobTitle)
            ? _options.JobTitle.Trim()
            : "Operations Manager";

        var adminDept = !isSuperAdminConfigured && !string.IsNullOrWhiteSpace(_options.Department)
            ? _options.Department.Trim()
            : "Operations";

        var adminUser = await EnsureUserAsync(
            email: adminEmail,
            fullName: adminFullName,
            jobTitle: adminJobTitle,
            department: adminDept,
            roleName: RoleNames.Admin,
            password: defaultPassword);

        if (adminUser != null)
        {
            await EnsureEmployeeAsync(
                employeeCode: "EMP-ADMIN01",
                firstName: "Operations",
                lastName: "Administrator",
                email: adminEmail,
                jobTitle: adminJobTitle,
                department: adminDept,
                phoneNumber: "+201000000002",
                hireDate: new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                userId: adminUser.Id);
        }

        var supervisorUser = await EnsureUserAsync(
            email: "supervisor@nasaq.local",
            fullName: "Ahmad Supervisor",
            jobTitle: "Photography Field Supervisor",
            department: "Photography",
            roleName: RoleNames.Supervisor,
            password: defaultPassword);

        Employee? supervisorEmp = null;
        if (supervisorUser != null)
        {
            supervisorEmp = await EnsureEmployeeAsync(
                employeeCode: "EMP-SUP01",
                firstName: "Ahmad",
                lastName: "Supervisor",
                email: "supervisor@nasaq.local",
                jobTitle: "Photography Field Supervisor",
                department: "Photography",
                phoneNumber: "+201000000003",
                hireDate: new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                userId: supervisorUser.Id);
        }

        var emp1User = await EnsureUserAsync(
            email: "employee@nasaq.local",
            fullName: "Mohamed Photographer",
            jobTitle: "Field Photographer",
            department: "Photography",
            roleName: RoleNames.Employee,
            password: defaultPassword);

        if (emp1User != null)
        {
            await EnsureEmployeeAsync(
                employeeCode: "EMP-001",
                firstName: "Mohamed",
                lastName: "Photographer",
                email: "employee@nasaq.local",
                jobTitle: "Field Photographer",
                department: "Photography",
                phoneNumber: "+201000000004",
                hireDate: new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                userId: emp1User.Id,
                supervisorId: supervisorEmp?.Id);
        }

        var emp2User = await EnsureUserAsync(
            email: "employee2@nasaq.local",
            fullName: "Sara Logistics",
            jobTitle: "Equipment Specialist",
            department: "Logistics",
            roleName: RoleNames.Employee,
            password: defaultPassword);

        if (emp2User != null)
        {
            await EnsureEmployeeAsync(
                employeeCode: "EMP-002",
                firstName: "Sara",
                lastName: "Logistics",
                email: "employee2@nasaq.local",
                jobTitle: "Equipment Specialist",
                department: "Logistics",
                phoneNumber: "+201000000005",
                hireDate: new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                userId: emp2User.Id,
                supervisorId: null);
        }
    }

    private async Task<ApplicationUser?> EnsureUserAsync(
        string email,
        string fullName,
        string jobTitle,
        string department,
        string roleName,
        string password)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(normalizedEmail);

        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = normalizedEmail,
                Email = normalizedEmail,
                FullName = fullName.Trim(),
                JobTitle = jobTitle.Trim(),
                Department = department.Trim(),
                EmailConfirmed = true,
                IsActive = true,
                MustChangePasswordOnNextLogin = false
            };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                logger.LogError("Failed to seed user '{Email}': {Errors}", normalizedEmail, string.Join(", ", createResult.Errors.Select(e => e.Description)));
                return null;
            }

            logger.LogInformation("Seeded user '{Email}' ({FullName})", normalizedEmail, fullName);
        }
        else
        {
            bool userUpdated = false;
            if (user.FullName != fullName.Trim())
            {
                user.FullName = fullName.Trim();
                userUpdated = true;
            }
            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                userUpdated = true;
            }
            if (!user.IsActive)
            {
                user.IsActive = true;
                userUpdated = true;
            }
            if (userUpdated)
            {
                await userManager.UpdateAsync(user);
            }
        }

        var currentRoles = await userManager.GetRolesAsync(user);
        if (!currentRoles.Contains(roleName))
        {
            await userManager.AddToRoleAsync(user, roleName);
            logger.LogInformation("Assigned role '{Role}' to user '{Email}'", roleName, normalizedEmail);
        }

        return user;
    }

    private async Task<Employee?> EnsureEmployeeAsync(
        string employeeCode,
        string firstName,
        string lastName,
        string email,
        string? jobTitle,
        string? department,
        string? phoneNumber,
        DateTime hireDate,
        string userId,
        Guid? supervisorId = null)
    {
        var normalizedCode = employeeCode.Trim();
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var employee = await dbContext.Employees
            .FirstOrDefaultAsync(e => e.EmployeeCode == normalizedCode || e.UserId == userId || e.Email == normalizedEmail);

        if (employee == null)
        {
            employee = new Employee
            {
                EmployeeCode = normalizedCode,
                FirstName = firstName.Trim(),
                LastName = lastName.Trim(),
                Email = normalizedEmail,
                JobTitle = jobTitle?.Trim(),
                Department = department?.Trim(),
                PhoneNumber = phoneNumber?.Trim(),
                HireDate = hireDate,
                IsActive = true,
                UserId = userId,
                SupervisorId = supervisorId
            };

            dbContext.Employees.Add(employee);
            await dbContext.SaveChangesAsync();
            logger.LogInformation("Seeded employee [{Code}] {FullName} (UserId: {UserId})", normalizedCode, employee.FullName, userId);
        }
        else
        {
            bool updated = false;
            if (employee.FirstName != firstName.Trim())
            {
                employee.FirstName = firstName.Trim();
                updated = true;
            }
            if (employee.LastName != lastName.Trim())
            {
                employee.LastName = lastName.Trim();
                updated = true;
            }
            if (employee.UserId != userId)
            {
                employee.UserId = userId;
                updated = true;
            }
            if (supervisorId.HasValue && employee.SupervisorId != supervisorId.Value)
            {
                employee.SupervisorId = supervisorId;
                updated = true;
            }
            if (!employee.IsActive)
            {
                employee.IsActive = true;
                updated = true;
            }
            if (updated)
            {
                await dbContext.SaveChangesAsync();
                logger.LogInformation("Updated seeded employee [{Code}] {FullName}", normalizedCode, employee.FullName);
            }
        }

        return employee;
    }

    private async Task SeedLocationsAsync()
    {
        if (!await dbContext.WorkLocations.AnyAsync())
        {
            var hq = new WorkLocation
            {
                Name = "HQ - Riyadh",
                Latitude = 24.713552,
                Longitude = 46.675296,
                RadiusMeters = 150.0,
                AccuracyThresholdMeters = 50.0,
                IsActive = true
            };

            var branch = new WorkLocation
            {
                Name = "Main Branch - Jeddah",
                Latitude = 21.543333,
                Longitude = 39.172778,
                RadiusMeters = 200.0,
                AccuracyThresholdMeters = 50.0,
                IsActive = true
            };

            dbContext.WorkLocations.AddRange(hq, branch);
            await dbContext.SaveChangesAsync();
            logger.LogInformation("Seeded default work locations: {HQ}, {Branch}", hq.Name, branch.Name);

            var emp = await dbContext.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-001");
            if (emp != null)
            {
                emp.WorkLocationId = hq.Id;
                await dbContext.SaveChangesAsync();
            }
        }
    }

    private async Task SeedLeaveTypesAsync()
    {
        if (!await dbContext.LeaveTypes.AnyAsync())
        {
            var annual = new LeaveType
            {
                Name = "Annual Leave",
                NameAr = "إجازة سنوية",
                Code = "ANNUAL",
                Description = "Standard annual vacation leave entitlement",
                IsPaid = true,
                RequiresAttachment = false,
                DefaultDaysPerYear = 21,
                IsActive = true
            };

            var sick = new LeaveType
            {
                Name = "Sick Leave",
                NameAr = "إجازة مرضية",
                Code = "SICK",
                Description = "Medical and health related absence requiring supporting documentation",
                IsPaid = true,
                RequiresAttachment = true,
                DefaultDaysPerYear = 15,
                IsActive = true
            };

            var emergency = new LeaveType
            {
                Name = "Emergency Leave",
                NameAr = "إجازة اضطرارية",
                Code = "EMERGENCY",
                Description = "Short notice urgent personal circumstances",
                IsPaid = true,
                RequiresAttachment = false,
                DefaultDaysPerYear = 5,
                IsActive = true
            };

            var unpaid = new LeaveType
            {
                Name = "Unpaid Leave",
                NameAr = "إجازة بدون راتب",
                Code = "UNPAID",
                Description = "Approved extended leave without salary compensation",
                IsPaid = false,
                RequiresAttachment = false,
                IsActive = true
            };

            dbContext.LeaveTypes.AddRange(annual, sick, emergency, unpaid);
            await dbContext.SaveChangesAsync();
            logger.LogInformation("Seeded default leave types: Annual, Sick, Emergency, Unpaid.");
        }
    }
}
