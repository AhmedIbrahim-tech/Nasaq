using Microsoft.Extensions.Configuration;

namespace Tests;

public class SafeDataSeedingPreservationTests : IDisposable
{
    private readonly ServiceProvider _serviceProvider;
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ILogger<DbInitializer> _logger;
    private readonly IConfiguration _configuration;

    public SafeDataSeedingPreservationTests()
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

        var inMemorySettings = new Dictionary<string, string?>
        {
            ["Database:SeedDataOnStartup"] = "true",
            ["Database:SeedDevFixtures"] = "true",
            ["DefaultAdmin:AutoSeed"] = "true"
        };
        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _serviceProvider = services.BuildServiceProvider();
        _dbContext = _serviceProvider.GetRequiredService<ApplicationDbContext>();
        _userManager = _serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        _roleManager = _serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        _logger = _serviceProvider.GetRequiredService<ILogger<DbInitializer>>();
    }

    private DbInitializer CreateInitializer(IConfiguration? config = null)
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

        return new DbInitializer(
            _roleManager,
            _userManager,
            _dbContext,
            options,
            _logger,
            config ?? _configuration);
    }

    [Fact]
    public async Task Test1_EmptyDatabase_Should_Seed_Initial_Records_Successfully()
    {
        // Arrange
        var initializer = CreateInitializer();

        // Act
        await initializer.SeedAsync();

        // Assert - Master and Reference Tables
        Assert.Equal(4, await _dbContext.Roles.CountAsync());
        Assert.Equal(5, await _dbContext.Users.CountAsync());
        Assert.Equal(5, await _dbContext.Employees.CountAsync());
        Assert.Equal(2, await _dbContext.WorkLocations.CountAsync());
        Assert.Equal(4, await _dbContext.LeaveTypes.CountAsync());
        Assert.Equal(3, await _dbContext.WorkShifts.CountAsync());
        Assert.Equal(1, await _dbContext.WorkSchedules.CountAsync());
        Assert.Equal(7, await _dbContext.PointRules.CountAsync());

        // Assert - Operational Fixtures
        Assert.True(await _dbContext.PointTransactions.CountAsync() > 0);
        Assert.True(await _dbContext.LeaveRequests.CountAsync() > 0);
        Assert.True(await _dbContext.AttendanceRecords.CountAsync() > 0);
    }

    [Fact]
    public async Task Test2_NormalBackendRestart_Should_Not_Overwrite_Manual_Modifications()
    {
        // 1. Initial Seed
        var initializer = CreateInitializer();
        await initializer.SeedAsync();

        // 2. Perform manual modifications on seeded records
        var emp = await _dbContext.Employees.FirstAsync(e => e.EmployeeCode == "EMP-001");
        emp.FirstName = "ManuallyEditedFirst";
        emp.LastName = "ManuallyEditedLast";
        emp.IsActive = false;

        var user = await _userManager.FindByEmailAsync("employee@nasaq.local");
        Assert.NotNull(user);
        user.FullName = "Manually Edited User FullName";
        user.IsActive = false;
        await _userManager.UpdateAsync(user);

        var location = await _dbContext.WorkLocations.FirstAsync(l => l.Name.Contains("Riyadh"));
        location.Name = "Renamed HQ Olaya";
        location.RadiusMeters = 888.0;

        var leaveType = await _dbContext.LeaveTypes.FirstAsync(lt => lt.Code == "ANNUAL");
        leaveType.DefaultDaysPerYear = 45;
        leaveType.Description = "Custom negotiated annual leave";

        await _dbContext.SaveChangesAsync();

        var initialUserCount = await _dbContext.Users.CountAsync();
        var initialEmpCount = await _dbContext.Employees.CountAsync();
        var initialLocCount = await _dbContext.WorkLocations.CountAsync();
        var initialLeaveTypeCount = await _dbContext.LeaveTypes.CountAsync();

        // 3. Simulate Restart: Create a fresh initializer on the same DB instance
        var restartInitializer = CreateInitializer();
        await restartInitializer.SeedAsync();

        // 4. Assert: No duplicate records inserted
        Assert.Equal(initialUserCount, await _dbContext.Users.CountAsync());
        Assert.Equal(initialEmpCount, await _dbContext.Employees.CountAsync());
        Assert.Equal(initialLocCount, await _dbContext.WorkLocations.CountAsync());
        Assert.Equal(initialLeaveTypeCount, await _dbContext.LeaveTypes.CountAsync());

        // 5. Assert: Manual modifications remain 100% intact
        var reloadedEmp = await _dbContext.Employees.FirstAsync(e => e.EmployeeCode == "EMP-001");
        Assert.Equal("ManuallyEditedFirst", reloadedEmp.FirstName);
        Assert.Equal("ManuallyEditedLast", reloadedEmp.LastName);
        Assert.False(reloadedEmp.IsActive);

        var reloadedUser = await _userManager.FindByEmailAsync("employee@nasaq.local");
        Assert.NotNull(reloadedUser);
        Assert.Equal("Manually Edited User FullName", reloadedUser.FullName);
        Assert.False(reloadedUser.IsActive);

        var reloadedLoc = await _dbContext.WorkLocations.FirstAsync(l => l.Id == location.Id);
        Assert.Equal("Renamed HQ Olaya", reloadedLoc.Name);
        Assert.Equal(888.0, reloadedLoc.RadiusMeters);

        var reloadedLeaveType = await _dbContext.LeaveTypes.FirstAsync(lt => lt.Code == "ANNUAL");
        Assert.Equal(45, reloadedLeaveType.DefaultDaysPerYear);
        Assert.Equal("Custom negotiated annual leave", reloadedLeaveType.Description);
    }

    [Fact]
    public async Task Test3_PartiallyPopulatedDatabase_Should_Skip_Populated_And_Seed_Empty()
    {
        // 1. Manually insert one custom location into an otherwise completely empty DB
        var customLocation = new WorkLocation
        {
            Name = "Existing Custom Remote Office",
            NameAr = "مكتب خارجي مسبق",
            Address = "King Fahd Road, Riyadh",
            Latitude = 24.7000,
            Longitude = 46.6800,
            RadiusMeters = 250,
            AccuracyThresholdMeters = 50,
            IsActive = true
        };
        _dbContext.WorkLocations.Add(customLocation);
        await _dbContext.SaveChangesAsync();

        Assert.Equal(1, await _dbContext.WorkLocations.CountAsync());
        Assert.Equal(0, await _dbContext.LeaveTypes.CountAsync());

        // 2. Run Seeder
        var initializer = CreateInitializer();
        await initializer.SeedAsync();

        // 3. Assert:
        // Populated table (WorkLocations) was completely skipped -> count remains exactly 1!
        Assert.Equal(1, await _dbContext.WorkLocations.CountAsync());
        var singleLoc = await _dbContext.WorkLocations.FirstAsync();
        Assert.Equal("Existing Custom Remote Office", singleLoc.Name);

        // Empty table (LeaveTypes) was populated with its 4 default types
        Assert.Equal(4, await _dbContext.LeaveTypes.CountAsync());
    }

    [Fact]
    public async Task Test4_MultipleRestarts_Should_Never_Change_Data_Or_Counts()
    {
        // 1. Initial Seed
        var initializer = CreateInitializer();
        await initializer.SeedAsync();

        // Snapshot counts
        var usersCount = await _dbContext.Users.CountAsync();
        var empCount = await _dbContext.Employees.CountAsync();
        var rolesCount = await _dbContext.Roles.CountAsync();
        var locCount = await _dbContext.WorkLocations.CountAsync();
        var leaveTypesCount = await _dbContext.LeaveTypes.CountAsync();
        var shiftsCount = await _dbContext.WorkShifts.CountAsync();
        var schedulesCount = await _dbContext.WorkSchedules.CountAsync();
        var pointRulesCount = await _dbContext.PointRules.CountAsync();
        var pointTxCount = await _dbContext.PointTransactions.CountAsync();
        var leaveReqCount = await _dbContext.LeaveRequests.CountAsync();
        var attCount = await _dbContext.AttendanceRecords.CountAsync();

        // 2. Restart 5 times consecutively
        for (int i = 1; i <= 5; i++)
        {
            var restartInitializer = CreateInitializer();
            await restartInitializer.SeedAsync();

            Assert.Equal(usersCount, await _dbContext.Users.CountAsync());
            Assert.Equal(empCount, await _dbContext.Employees.CountAsync());
            Assert.Equal(rolesCount, await _dbContext.Roles.CountAsync());
            Assert.Equal(locCount, await _dbContext.WorkLocations.CountAsync());
            Assert.Equal(leaveTypesCount, await _dbContext.LeaveTypes.CountAsync());
            Assert.Equal(shiftsCount, await _dbContext.WorkShifts.CountAsync());
            Assert.Equal(schedulesCount, await _dbContext.WorkSchedules.CountAsync());
            Assert.Equal(pointRulesCount, await _dbContext.PointRules.CountAsync());
            Assert.Equal(pointTxCount, await _dbContext.PointTransactions.CountAsync());
            Assert.Equal(leaveReqCount, await _dbContext.LeaveRequests.CountAsync());
            Assert.Equal(attCount, await _dbContext.AttendanceRecords.CountAsync());
        }
    }

    [Fact]
    public async Task Test5_ExistingOperationalData_Should_Be_Preserved_And_Not_Recreated()
    {
        // 1. Initial Seed
        var initializer = CreateInitializer();
        await initializer.SeedAsync();

        // 2. Create custom operational business data
        var emp = await _dbContext.Employees.FirstAsync();
        var leaveType = await _dbContext.LeaveTypes.FirstAsync();

        var customLeave = new LeaveRequest
        {
            EmployeeId = emp.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = new DateOnly(2027, 5, 1),
            EndDate = new DateOnly(2027, 5, 5),
            DaysCount = 5,
            Reason = "Custom confidential family leave",
            Status = LeaveRequestStatus.Approved,
            SubmittedAtUtc = DateTime.UtcNow,
            ReviewedAtUtc = DateTime.UtcNow,
            ReviewedBy = "Executive Reviewer",
            ReviewNotes = "Approved per special agreement"
        };
        _dbContext.LeaveRequests.Add(customLeave);

        var customAttendance = new AttendanceRecord
        {
            EmployeeId = emp.Id,
            Date = new DateOnly(2027, 1, 15),
            CheckInTimeUtc = DateTime.UtcNow,
            CheckInStatus = VerificationStatus.Verified,
            Status = AttendanceStatus.Present,
            Notes = "Custom field operational attendance"
        };
        _dbContext.AttendanceRecords.Add(customAttendance);

        var customPointTx = new PointTransaction
        {
            EmployeeId = emp.Id,
            Points = 10,
            Category = PointCategory.Green,
            EventType = PointEventType.CompletedShift,
            Status = PointTransactionStatus.Finalized,
            Date = new DateOnly(2027, 1, 15),
            Reason = "Special recognition bonus points"
        };
        _dbContext.PointTransactions.Add(customPointTx);

        await _dbContext.SaveChangesAsync();

        var leaveCountBefore = await _dbContext.LeaveRequests.CountAsync();
        var attCountBefore = await _dbContext.AttendanceRecords.CountAsync();
        var ptCountBefore = await _dbContext.PointTransactions.CountAsync();

        // 3. Restart Backend
        var restartInitializer = CreateInitializer();
        await restartInitializer.SeedAsync();

        // 4. Assert: Operational records counts are preserved exactly
        Assert.Equal(leaveCountBefore, await _dbContext.LeaveRequests.CountAsync());
        Assert.Equal(attCountBefore, await _dbContext.AttendanceRecords.CountAsync());
        Assert.Equal(ptCountBefore, await _dbContext.PointTransactions.CountAsync());

        // 5. Assert: The custom records remain untouched with original values
        var reloadedLeave = await _dbContext.LeaveRequests.FirstAsync(l => l.Id == customLeave.Id);
        Assert.Equal("Custom confidential family leave", reloadedLeave.Reason);
        Assert.Equal("Approved per special agreement", reloadedLeave.ReviewNotes);

        var reloadedAtt = await _dbContext.AttendanceRecords.FirstAsync(a => a.Id == customAttendance.Id);
        Assert.Equal("Custom field operational attendance", reloadedAtt.Notes);

        var reloadedPt = await _dbContext.PointTransactions.FirstAsync(p => p.Id == customPointTx.Id);
        Assert.Equal("Special recognition bonus points", reloadedPt.Reason);
        Assert.Equal(10, reloadedPt.Points);
    }

    [Fact]
    public async Task Test6_ConcurrentInitialization_Should_Not_Create_Duplicates_Or_Inconsistencies()
    {
        // 1. Two separate initializer instances targeting the same empty DB
        var initializer1 = CreateInitializer();
        var initializer2 = CreateInitializer();

        // 2. Execute concurrently
        await Task.WhenAll(
            Task.Run(() => initializer1.SeedAsync()),
            Task.Run(() => initializer2.SeedAsync())
        );

        // 3. Assert: Exactly one set of seeded records was inserted
        Assert.Equal(4, await _dbContext.Roles.CountAsync());
        Assert.Equal(5, await _dbContext.Users.CountAsync());
        Assert.Equal(5, await _dbContext.Employees.CountAsync());
        Assert.Equal(2, await _dbContext.WorkLocations.CountAsync());
        Assert.Equal(4, await _dbContext.LeaveTypes.CountAsync());
        Assert.Equal(3, await _dbContext.WorkShifts.CountAsync());
        Assert.Equal(1, await _dbContext.WorkSchedules.CountAsync());
        Assert.Equal(7, await _dbContext.PointRules.CountAsync());
    }

    public void Dispose()
    {
        _dbContext.Dispose();
        _serviceProvider.Dispose();
    }
}
