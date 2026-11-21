using Tests.Fakes;

namespace Tests;

public class TestFixture : IDisposable
{
    public ServiceProvider ServiceProvider { get; }
    public ApplicationDbContext DbContext { get; }
    public UserManager<ApplicationUser> UserManager { get; }
    public RoleManager<ApplicationRole> RoleManager { get; }
    public FakeTemporaryPasswordService PasswordService { get; }
    public IUnitOfWork UnitOfWork { get; }
    public FileService FileService { get; }
    public FileValidationService ValidationService { get; }
    public IOptions<StorageOptions> StorageOptionsWrapper { get; }
    public string TempStorageDirectory { get; }

    public ApplicationUser SuperAdminUser { get; private set; } = null!;
    public ApplicationUser AdminUser { get; private set; } = null!;
    public ApplicationUser SupervisorAUser { get; private set; } = null!;
    public ApplicationUser SupervisorBUser { get; private set; } = null!;
    public ApplicationUser Employee1User { get; private set; } = null!;
    public ApplicationUser Employee2User { get; private set; } = null!;
    public ApplicationUser UnassignedEmpUser { get; private set; } = null!;

    public Employee SuperAdminEmp { get; private set; } = null!;
    public Employee AdminEmp { get; private set; } = null!;
    public Employee SupervisorAEmp { get; private set; } = null!;
    public Employee SupervisorBEmp { get; private set; } = null!;
    public Employee Employee1 { get; private set; } = null!;
    public Employee Employee2 { get; private set; } = null!;
    public Employee UnassignedEmp { get; private set; } = null!;

    public TestFixture()
    {
        var services = new ServiceCollection();
        var dbName = Guid.NewGuid().ToString();

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase(dbName));

        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        services.AddLogging(builder => builder.AddDebug());
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        ServiceProvider = services.BuildServiceProvider();
        DbContext = ServiceProvider.GetRequiredService<ApplicationDbContext>();
        UserManager = ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        RoleManager = ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        PasswordService = new FakeTemporaryPasswordService();

        TempStorageDirectory = Path.Combine(Path.GetTempPath(), "NASAQ_Test_EmployeePhoto_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(TempStorageDirectory);

        var storageOptions = new StorageOptions
        {
            RootPath = TempStorageDirectory,
            MaxFileSizeBytes = 10 * 1024 * 1024,
            MaxFilesPerUpload = 5,
            AllowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx", ".xlsx"]
        };
        StorageOptionsWrapper = Options.Create(storageOptions);

        UnitOfWork = new UnitOfWork(DbContext, Microsoft.Extensions.Logging.Abstractions.NullLogger<UnitOfWork>.Instance);
        ValidationService = new FileValidationService(StorageOptionsWrapper);
        FileService = new FileService(StorageOptionsWrapper, ValidationService, DbContext, new FakeCurrentUser(), Microsoft.Extensions.Logging.Abstractions.NullLogger<FileService>.Instance);
    }

    public async Task InitializeAsync()
    {
        // 1. Seed Roles
        foreach (var role in RoleNames.All)
        {
            if (!await RoleManager.RoleExistsAsync(role))
            {
                await RoleManager.CreateAsync(new ApplicationRole { Name = role, NormalizedName = role.ToUpperInvariant() });
            }
        }

        // 2. SuperAdmin
        SuperAdminUser = new ApplicationUser
        {
            UserName = "superadmin@nasaq.test",
            Email = "superadmin@nasaq.test",
            FullName = "Super Admin",
            IsActive = true,
            EmailConfirmed = true
        };
        await UserManager.CreateAsync(SuperAdminUser, "Password123!");
        await UserManager.AddToRoleAsync(SuperAdminUser, RoleNames.SuperAdmin);

        SuperAdminEmp = new Employee
        {
            EmployeeCode = "EMP-SUPER",
            FirstName = "Super",
            LastName = "Admin",
            Email = "superadmin@nasaq.test",
            IsActive = true,
            UserId = SuperAdminUser.Id,
            Department = "Administration",
            HireDate = DateTime.UtcNow.Date
        };
        DbContext.Employees.Add(SuperAdminEmp);

        // 3. Admin
        AdminUser = new ApplicationUser
        {
            UserName = "admin@nasaq.test",
            Email = "admin@nasaq.test",
            FullName = "Operations Admin",
            IsActive = true,
            EmailConfirmed = true
        };
        await UserManager.CreateAsync(AdminUser, "Password123!");
        await UserManager.AddToRoleAsync(AdminUser, RoleNames.Admin);

        AdminEmp = new Employee
        {
            EmployeeCode = "EMP-ADMIN",
            FirstName = "Operations",
            LastName = "Admin",
            Email = "admin@nasaq.test",
            IsActive = true,
            UserId = AdminUser.Id,
            Department = "Administration",
            HireDate = DateTime.UtcNow.Date
        };
        DbContext.Employees.Add(AdminEmp);

        // 4. Supervisor A
        SupervisorAUser = new ApplicationUser
        {
            UserName = "supervisorA@nasaq.test",
            Email = "supervisora@nasaq.test",
            FullName = "Supervisor Alpha",
            IsActive = true,
            EmailConfirmed = true
        };
        await UserManager.CreateAsync(SupervisorAUser, "Password123!");
        await UserManager.AddToRoleAsync(SupervisorAUser, RoleNames.Supervisor);

        SupervisorAEmp = new Employee
        {
            EmployeeCode = "EMP-SUP-A",
            FirstName = "Supervisor",
            LastName = "Alpha",
            Email = "supervisora@nasaq.test",
            IsActive = true,
            UserId = SupervisorAUser.Id,
            Department = "Photography",
            HireDate = DateTime.UtcNow.Date
        };
        DbContext.Employees.Add(SupervisorAEmp);

        // 5. Supervisor B
        SupervisorBUser = new ApplicationUser
        {
            UserName = "supervisorB@nasaq.test",
            Email = "supervisorb@nasaq.test",
            FullName = "Supervisor Beta",
            IsActive = true,
            EmailConfirmed = true
        };
        await UserManager.CreateAsync(SupervisorBUser, "Password123!");
        await UserManager.AddToRoleAsync(SupervisorBUser, RoleNames.Supervisor);

        SupervisorBEmp = new Employee
        {
            EmployeeCode = "EMP-SUP-B",
            FirstName = "Supervisor",
            LastName = "Beta",
            Email = "supervisorb@nasaq.test",
            IsActive = true,
            UserId = SupervisorBUser.Id,
            Department = "Editing",
            HireDate = DateTime.UtcNow.Date
        };
        DbContext.Employees.Add(SupervisorBEmp);

        await DbContext.SaveChangesAsync();

        // 6. Employee 1 (Assigned to Supervisor A)
        Employee1User = new ApplicationUser
        {
            UserName = "emp1@nasaq.test",
            Email = "emp1@nasaq.test",
            FullName = "Employee One",
            IsActive = true,
            EmailConfirmed = true
        };
        await UserManager.CreateAsync(Employee1User, "Password123!");
        await UserManager.AddToRoleAsync(Employee1User, RoleNames.Employee);

        Employee1 = new Employee
        {
            EmployeeCode = "EMP-001",
            FirstName = "Employee",
            LastName = "One",
            Email = "emp1@nasaq.test",
            IsActive = true,
            UserId = Employee1User.Id,
            Department = "Photography",
            SupervisorId = SupervisorAEmp.Id,
            HireDate = DateTime.UtcNow.Date
        };
        DbContext.Employees.Add(Employee1);

        // 7. Employee 2 (Assigned to Supervisor B)
        Employee2User = new ApplicationUser
        {
            UserName = "emp2@nasaq.test",
            Email = "emp2@nasaq.test",
            FullName = "Employee Two",
            IsActive = true,
            EmailConfirmed = true
        };
        await UserManager.CreateAsync(Employee2User, "Password123!");
        await UserManager.AddToRoleAsync(Employee2User, RoleNames.Employee);

        Employee2 = new Employee
        {
            EmployeeCode = "EMP-002",
            FirstName = "Employee",
            LastName = "Two",
            Email = "emp2@nasaq.test",
            IsActive = true,
            UserId = Employee2User.Id,
            Department = "Editing",
            SupervisorId = SupervisorBEmp.Id,
            HireDate = DateTime.UtcNow.Date
        };
        DbContext.Employees.Add(Employee2);

        // 8. Unassigned Employee (No supervisor)
        UnassignedEmpUser = new ApplicationUser
        {
            UserName = "unassigned@nasaq.test",
            Email = "unassigned@nasaq.test",
            FullName = "Unassigned Staff",
            IsActive = true,
            EmailConfirmed = true
        };
        await UserManager.CreateAsync(UnassignedEmpUser, "Password123!");
        await UserManager.AddToRoleAsync(UnassignedEmpUser, RoleNames.Employee);

        UnassignedEmp = new Employee
        {
            EmployeeCode = "EMP-003",
            FirstName = "Unassigned",
            LastName = "Staff",
            Email = "unassigned@nasaq.test",
            IsActive = true,
            UserId = UnassignedEmpUser.Id,
            Department = "Logistics",
            SupervisorId = null,
            HireDate = DateTime.UtcNow.Date
        };
        DbContext.Employees.Add(UnassignedEmp);

        await DbContext.SaveChangesAsync();
    }

    public FakeCurrentUser CreateUserContext(ApplicationUser user, params string[] roles)
    {
        return new FakeCurrentUser
        {
            UserId = user.Id,
            UserName = user.UserName,
            RolesList = [.. roles]
        };
    }

    public void Dispose()
    {
        DbContext.Dispose();
        ServiceProvider.Dispose();
        if (Directory.Exists(TempStorageDirectory))
        {
            try
            {
                Directory.Delete(TempStorageDirectory, recursive: true);
            }
            catch
            {
            }
        }
    }
}
