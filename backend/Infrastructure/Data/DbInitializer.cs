namespace Infrastructure.Data;

public sealed class DbInitializer(
    RoleManager<ApplicationRole> roleManager,
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext,
    IOptions<DefaultAdminOptions> options,
    ILogger<DbInitializer> logger,
    IConfiguration? configuration = null,
    IHostEnvironment? environment = null)
{
    private static readonly SemaphoreSlim _initLock = new(1, 1);
    private readonly DefaultAdminOptions _options = options.Value;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var shouldSeed = _options.AutoSeed || (configuration?.GetValue<bool>("Database:SeedDataOnStartup", false) ?? false);
        if (!shouldSeed)
        {
            return;
        }

        // Concurrency safeguard across threads in the same process
        await _initLock.WaitAsync(cancellationToken);
        try
        {
            logger.LogInformation("Starting NASAQ database initialization & data seeding...");

            // 1. Roles (AspNetRoles) - Empty table check
            await SeedRolesAsync(cancellationToken);

            // 2. Users & Employees (AspNetUsers & Employees) - Tightly related empty check
            await SeedUsersAndEmployeesAsync(cancellationToken);

            // 3. WorkLocations - Empty table check
            await SeedLocationsAsync(cancellationToken);

            // 4. LeaveTypes - Empty table check
            await SeedLeaveTypesAsync(cancellationToken);

            // 5. SystemSettings - Empty table check
            await SeedSystemSettingsAsync(cancellationToken);

            // 6. Development Fixtures - Skipped in Production, Empty table checks in Dev
            var isProduction = environment?.IsProduction() ?? false;
            var shouldSeedDev = !isProduction && (configuration?.GetValue<bool>("Database:SeedDevFixtures", true) ?? true);

            if (isProduction)
            {
                logger.LogInformation("[SEEDER] DevDataSeeder: Production environment detected. Development fixtures skipped.");
            }
            else if (shouldSeedDev)
            {
                await DevDataSeeder.SeedDevFixturesAsync(dbContext, logger, cancellationToken);
            }

            logger.LogInformation("[DATABASE] Initialization completed successfully.");
        }
        finally
        {
            _initLock.Release();
        }
    }

    private async Task SeedRolesAsync(CancellationToken cancellationToken)
    {
        if (await dbContext.Roles.AnyAsync(cancellationToken))
        {
            logger.LogInformation("[SEEDER] Roles: Existing data detected. Seeding skipped.");
            return;
        }

        logger.LogInformation("[SEEDER] Roles: Table is empty. Initial seeding started.");

        string[] roles = [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor, RoleNames.Employee];
        int seededCount = 0;

        foreach (var roleName in roles)
        {
            var role = new ApplicationRole
            {
                Name = roleName,
                NormalizedName = roleName.ToUpperInvariant()
            };

            var result = await roleManager.CreateAsync(role);
            if (!result.Succeeded)
            {
                logger.LogError("[SEEDER] Roles: Failed to seed role {Role}: {Errors}", roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                continue;
            }

            var expectedPermissions = GetExpectedPermissionsForRole(roleName);
            foreach (var perm in expectedPermissions)
            {
                await roleManager.AddClaimAsync(role, new Claim("permission", perm));
            }

            seededCount++;
        }

        logger.LogInformation("[SEEDER] Roles: {Count} records inserted successfully.", seededCount);
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

    private async Task SeedUsersAndEmployeesAsync(CancellationToken cancellationToken)
    {
        var usersExist = await dbContext.Users.AnyAsync(cancellationToken);
        var employeesExist = await dbContext.Employees.AnyAsync(cancellationToken);

        if (usersExist || employeesExist)
        {
            if (usersExist)
            {
                logger.LogInformation("[SEEDER] Users: Existing data detected. Seeding skipped.");
            }
            if (employeesExist)
            {
                logger.LogInformation("[SEEDER] Employees: Existing operational data detected. Seeding skipped.");
            }
            return;
        }

        logger.LogInformation("[SEEDER] Users: Table is empty. Initial seeding started.");
        logger.LogInformation("[SEEDER] Employees: Table is empty. Initial seeding started.");

        var defaultPassword = !string.IsNullOrWhiteSpace(_options.Password) ? _options.Password : "Admin@123456";

        // Seed 1: SuperAdmin
        var superAdminEmail = "superadmin@nasaq.local";
        var superAdminUser = await CreateUserAsync(
            email: superAdminEmail,
            fullName: "System SuperAdmin",
            fullNameAr: "سوبر أدمن النظام",
            jobTitle: "Chief Technology Officer",
            jobTitleAr: "مدير التكنولوجيا التنفيذي",
            department: "Executive",
            departmentAr: "الإدارة التنفيذية",
            roleName: RoleNames.SuperAdmin,
            password: defaultPassword);

        if (superAdminUser != null)
        {
            await CreateEmployeeAsync(
                employeeCode: "EMP-SUPER01",
                firstName: "System",
                lastName: "SuperAdmin",
                firstNameAr: "سوبر أدمن",
                lastNameAr: "النظام",
                email: superAdminEmail,
                jobTitle: "Chief Technology Officer",
                jobTitleAr: "مدير التكنولوجيا التنفيذي",
                department: "Executive",
                departmentAr: "الإدارة التنفيذية",
                phoneNumber: "+201000000001",
                hireDate: new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                userId: superAdminUser.Id);
        }

        // Seed 2: Operations Administrator
        var adminEmail = "admin@nasaq.local";
        var adminUser = await CreateUserAsync(
            email: adminEmail,
            fullName: "Operations Administrator",
            fullNameAr: "مسؤول العمليات الإدارية",
            jobTitle: "Operations Manager",
            jobTitleAr: "مدير العمليات",
            department: "Operations",
            departmentAr: "العمليات",
            roleName: RoleNames.Admin,
            password: defaultPassword);

        if (adminUser != null)
        {
            await CreateEmployeeAsync(
                employeeCode: "EMP-ADMIN01",
                firstName: "Operations",
                lastName: "Administrator",
                firstNameAr: "مسؤول",
                lastNameAr: "العمليات",
                email: adminEmail,
                jobTitle: "Operations Manager",
                jobTitleAr: "مدير العمليات",
                department: "Operations",
                departmentAr: "العمليات",
                phoneNumber: "+201000000002",
                hireDate: new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                userId: adminUser.Id);
        }

        // Seed 3: Field Supervisor
        var supervisorEmail = "supervisor@nasaq.local";
        var supervisorUser = await CreateUserAsync(
            email: supervisorEmail,
            fullName: "Ahmad Supervisor",
            fullNameAr: "أحمد المشرف",
            jobTitle: "Photography Field Supervisor",
            jobTitleAr: "مشرف تصوير ميداني",
            department: "Photography",
            departmentAr: "التصوير",
            roleName: RoleNames.Supervisor,
            password: defaultPassword);

        Employee? supervisorEmp = null;
        if (supervisorUser != null)
        {
            supervisorEmp = await CreateEmployeeAsync(
                employeeCode: "EMP-SUP01",
                firstName: "Ahmad",
                lastName: "Supervisor",
                firstNameAr: "أحمد",
                lastNameAr: "المشرف",
                email: supervisorEmail,
                jobTitle: "Photography Field Supervisor",
                jobTitleAr: "مشرف تصوير ميداني",
                department: "Photography",
                departmentAr: "التصوير",
                phoneNumber: "+201000000003",
                hireDate: new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                userId: supervisorUser.Id);
        }

        // Seed 4: Field Photographer (EMP-001)
        var emp1Email = "employee@nasaq.local";
        var emp1User = await CreateUserAsync(
            email: emp1Email,
            fullName: "Mohamed Photographer",
            fullNameAr: "محمد المصور",
            jobTitle: "Field Photographer",
            jobTitleAr: "مصور ميداني",
            department: "Photography",
            departmentAr: "التصوير",
            roleName: RoleNames.Employee,
            password: defaultPassword);

        if (emp1User != null)
        {
            await CreateEmployeeAsync(
                employeeCode: "EMP-001",
                firstName: "Mohamed",
                lastName: "Photographer",
                firstNameAr: "محمد",
                lastNameAr: "المصور",
                email: emp1Email,
                jobTitle: "Field Photographer",
                jobTitleAr: "مصور ميداني",
                department: "Photography",
                departmentAr: "التصوير",
                phoneNumber: "+201000000004",
                hireDate: new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                userId: emp1User.Id,
                supervisorId: supervisorEmp?.Id);
        }

        // Seed 5: Equipment Specialist (EMP-002)
        var emp2Email = "employee2@nasaq.local";
        var emp2User = await CreateUserAsync(
            email: emp2Email,
            fullName: "Sara Logistics",
            fullNameAr: "سارة اللوجستية",
            jobTitle: "Equipment Specialist",
            jobTitleAr: "أخصائية معدات",
            department: "Logistics",
            departmentAr: "الخدمات اللوجستية",
            roleName: RoleNames.Employee,
            password: defaultPassword);

        if (emp2User != null)
        {
            await CreateEmployeeAsync(
                employeeCode: "EMP-002",
                firstName: "Sara",
                lastName: "Logistics",
                firstNameAr: "سارة",
                lastNameAr: "اللوجستية",
                email: emp2Email,
                jobTitle: "Equipment Specialist",
                jobTitleAr: "أخصائية معدات",
                department: "Logistics",
                departmentAr: "الخدمات اللوجستية",
                phoneNumber: "+201000000005",
                hireDate: new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                userId: emp2User.Id,
                supervisorId: null);
        }

        logger.LogInformation("[SEEDER] Users: 5 records inserted successfully.");
        logger.LogInformation("[SEEDER] Employees: 5 records inserted successfully.");
    }

    private async Task<ApplicationUser?> CreateUserAsync(
        string email,
        string fullName,
        string fullNameAr,
        string jobTitle,
        string jobTitleAr,
        string department,
        string departmentAr,
        string roleName,
        string password)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            FullName = fullName.Trim(),
            FullNameAr = fullNameAr.Trim(),
            JobTitle = jobTitle.Trim(),
            JobTitleAr = jobTitleAr.Trim(),
            Department = department.Trim(),
            DepartmentAr = departmentAr.Trim(),
            EmailConfirmed = true,
            IsActive = true,
            MustChangePasswordOnNextLogin = false
        };

        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            logger.LogError("[SEEDER] Users: Failed to create user '{Email}': {Errors}", normalizedEmail, string.Join(", ", createResult.Errors.Select(e => e.Description)));
            return null;
        }

        await userManager.AddToRoleAsync(user, roleName);
        return user;
    }

    private async Task<Employee?> CreateEmployeeAsync(
        string employeeCode,
        string firstName,
        string lastName,
        string firstNameAr,
        string lastNameAr,
        string email,
        string? jobTitle,
        string? jobTitleAr,
        string? department,
        string? departmentAr,
        string? phoneNumber,
        DateTime hireDate,
        string userId,
        Guid? supervisorId = null)
    {
        var normalizedCode = employeeCode.Trim();
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var employee = new Employee
        {
            EmployeeCode = normalizedCode,
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            FirstNameAr = firstNameAr.Trim(),
            LastNameAr = lastNameAr.Trim(),
            Email = normalizedEmail,
            JobTitle = jobTitle?.Trim(),
            JobTitleAr = jobTitleAr?.Trim(),
            Department = department?.Trim(),
            DepartmentAr = departmentAr?.Trim(),
            PhoneNumber = phoneNumber?.Trim(),
            HireDate = hireDate,
            IsActive = true,
            UserId = userId,
            SupervisorId = supervisorId
        };

        dbContext.Employees.Add(employee);
        await dbContext.SaveChangesAsync();
        return employee;
    }

    private async Task SeedLocationsAsync(CancellationToken cancellationToken)
    {
        if (await dbContext.WorkLocations.AnyAsync(cancellationToken))
        {
            logger.LogInformation("[SEEDER] WorkLocations: Existing data detected. Seeding skipped.");
            return;
        }

        logger.LogInformation("[SEEDER] WorkLocations: Table is empty. Initial seeding started.");

        var hq = new WorkLocation
        {
            Name = "HQ - Riyadh",
            NameAr = "المقر الرئيسي - الرياض",
            Address = "Olaya District, Riyadh",
            AddressAr = "حي العليا، الرياض",
            Latitude = 24.713552,
            Longitude = 46.675296,
            RadiusMeters = 150.0,
            AccuracyThresholdMeters = 50.0,
            IsActive = true
        };

        var branch = new WorkLocation
        {
            Name = "Main Branch - Jeddah",
            NameAr = "الفرع الرئيسي - جدة",
            Address = "Al Andalus District, Jeddah",
            AddressAr = "حي الأندلس، جدة",
            Latitude = 21.543333,
            Longitude = 39.172778,
            RadiusMeters = 200.0,
            AccuracyThresholdMeters = 50.0,
            IsActive = true
        };

        dbContext.WorkLocations.AddRange(hq, branch);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Optionally associate initial seeded EMP-001 with HQ if unassigned
        var emp = await dbContext.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-001", cancellationToken);
        if (emp != null && !emp.WorkLocationId.HasValue)
        {
            emp.WorkLocationId = hq.Id;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        logger.LogInformation("[SEEDER] WorkLocations: 2 records inserted successfully.");
    }

    private async Task SeedLeaveTypesAsync(CancellationToken cancellationToken)
    {
        if (await dbContext.LeaveTypes.AnyAsync(cancellationToken))
        {
            logger.LogInformation("[SEEDER] LeaveTypes: Existing data detected. Seeding skipped.");
            return;
        }

        logger.LogInformation("[SEEDER] LeaveTypes: Table is empty. Initial seeding started.");

        var annual = new LeaveType
        {
            Name = "Annual Leave",
            NameAr = "إجازة سنوية",
            Code = "ANNUAL",
            Description = "Standard annual vacation leave entitlement",
            DescriptionAr = "رصيد الإجازة السنوية الاعتيادية المعتمدة",
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
            DescriptionAr = "إجازة صحية ومرضية تتطلب تقريراً طبياً معتمداً",
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
            DescriptionAr = "إجازة لظروف شخصية عاجلة وضرورية",
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
            DescriptionAr = "إجازة بدون أجر تتطلب موافقة الإدارة مسبقاً",
            IsPaid = false,
            RequiresAttachment = false,
            IsActive = true
        };

        dbContext.LeaveTypes.AddRange(annual, sick, emergency, unpaid);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("[SEEDER] LeaveTypes: 4 records inserted successfully.");
    }

    private async Task SeedSystemSettingsAsync(CancellationToken cancellationToken)
    {
        if (await dbContext.SystemSettings.AnyAsync(cancellationToken))
        {
            logger.LogInformation("[SEEDER] SystemSettings: Existing data detected. Seeding skipped.");
            return;
        }

        logger.LogInformation("[SEEDER] SystemSettings: Table is empty. Initial seeding started.");

        var defaultGeofenceRadius = new SystemSetting
        {
            Id = Guid.NewGuid(),
            Key = "GlobalGeofenceRadiusMeters",
            Value = "50.0",
            Description = "Global geofence radius in meters for all approved personal and company locations",
            Created_Utc = DateTime.UtcNow,
            Created_By = "system"
        };

        await dbContext.SystemSettings.AddAsync(defaultGeofenceRadius, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("[SEEDER] SystemSettings: 1 record inserted successfully.");
    }
}
