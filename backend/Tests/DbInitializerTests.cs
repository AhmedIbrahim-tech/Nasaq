namespace Tests;

public class DbInitializerTests : IDisposable
{
    private readonly ServiceProvider _serviceProvider;
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ILogger<DbInitializer> _logger;

    public DbInitializerTests()
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

        _serviceProvider = services.BuildServiceProvider();
        _dbContext = _serviceProvider.GetRequiredService<ApplicationDbContext>();
        _userManager = _serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        _roleManager = _serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        _logger = _serviceProvider.GetRequiredService<ILogger<DbInitializer>>();
    }

    [Fact]
    public async Task SeedAsync_Should_Seed_All_User_Types_And_Linked_Employees()
    {
        var options = Options.Create(new DefaultAdminOptions
        {
            AutoSeed = true,
            Email = "admin@nasaq.local",
            Password = "Admin@123456",
            FullName = "Operations Administrator",
            JobTitle = "Operations Manager",
            Department = "Operations"
        });

        var initializer = new DbInitializer(_roleManager, _userManager, _dbContext, options, _logger);

        await initializer.SeedAsync();

        foreach (var roleName in RoleNames.All)
        {
            var roleExists = await _roleManager.RoleExistsAsync(roleName);
            Assert.True(roleExists, $"Role '{roleName}' was not created.");

            var role = await _roleManager.FindByNameAsync(roleName);
            Assert.NotNull(role);
            var claims = await _roleManager.GetClaimsAsync(role);
            Assert.NotEmpty(claims);
        }

        var superAdmin = await _userManager.FindByEmailAsync("superadmin@nasaq.local");
        Assert.NotNull(superAdmin);
        Assert.True(await _userManager.IsInRoleAsync(superAdmin, RoleNames.SuperAdmin));
        var superAdminEmp = await _dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == superAdmin.Id);
        Assert.NotNull(superAdminEmp);
        Assert.Equal("EMP-SUPER01", superAdminEmp.EmployeeCode);
        Assert.True(superAdminEmp.IsActive);

        var admin = await _userManager.FindByEmailAsync("admin@nasaq.local");
        Assert.NotNull(admin);
        Assert.True(await _userManager.IsInRoleAsync(admin, RoleNames.Admin));
        var adminEmp = await _dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == admin.Id);
        Assert.NotNull(adminEmp);
        Assert.Equal("EMP-ADMIN01", adminEmp.EmployeeCode);
        Assert.True(adminEmp.IsActive);

        var supervisor = await _userManager.FindByEmailAsync("supervisor@nasaq.local");
        Assert.NotNull(supervisor);
        Assert.True(await _userManager.IsInRoleAsync(supervisor, RoleNames.Supervisor));
        var supervisorEmp = await _dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == supervisor.Id);
        Assert.NotNull(supervisorEmp);
        Assert.Equal("EMP-SUP01", supervisorEmp.EmployeeCode);
        Assert.True(supervisorEmp.IsActive);

        var employee = await _userManager.FindByEmailAsync("employee@nasaq.local");
        Assert.NotNull(employee);
        Assert.True(await _userManager.IsInRoleAsync(employee, RoleNames.Employee));
        var employeeEmp = await _dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == employee.Id);
        Assert.NotNull(employeeEmp);
        Assert.Equal("EMP-001", employeeEmp.EmployeeCode);
        Assert.Equal(supervisorEmp.Id, employeeEmp.SupervisorId);
        Assert.True(employeeEmp.IsActive);

        var employee2 = await _userManager.FindByEmailAsync("employee2@nasaq.local");
        Assert.NotNull(employee2);
        Assert.True(await _userManager.IsInRoleAsync(employee2, RoleNames.Employee));
        var employee2Emp = await _dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == employee2.Id);
        Assert.NotNull(employee2Emp);
        Assert.Equal("EMP-002", employee2Emp.EmployeeCode);
        Assert.Null(employee2Emp.SupervisorId);
        Assert.True(employee2Emp.IsActive);

        // Verify Idempotency on second execution
        await initializer.SeedAsync();

        var userCount = await _userManager.Users.CountAsync();
        Assert.Equal(5, userCount);

        var employeeCount = await _dbContext.Employees.CountAsync();
        Assert.Equal(5, employeeCount);
    }

    [Fact]
    public async Task SeedAsync_When_AutoSeed_False_Should_Not_Seed()
    {
        var options = Options.Create(new DefaultAdminOptions
        {
            AutoSeed = false
        });

        var initializer = new DbInitializer(_roleManager, _userManager, _dbContext, options, _logger);

        await initializer.SeedAsync();

        var userCount = await _userManager.Users.CountAsync();
        Assert.Equal(0, userCount);

        var employeeCount = await _dbContext.Employees.CountAsync();
        Assert.Equal(0, employeeCount);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
        _serviceProvider.Dispose();
    }
}
