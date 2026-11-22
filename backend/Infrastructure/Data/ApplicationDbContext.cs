namespace Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AppNotification> AppNotifications => Set<AppNotification>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();
    public DbSet<WorkLocation> WorkLocations => Set<WorkLocation>();
    public DbSet<WorkShift> WorkShifts => Set<WorkShift>();
    public DbSet<WorkSchedule> WorkSchedules => Set<WorkSchedule>();
    public DbSet<WorkScheduleDay> WorkScheduleDays => Set<WorkScheduleDay>();
    public DbSet<EmployeeScheduleAssignment> EmployeeScheduleAssignments => Set<EmployeeScheduleAssignment>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<PointRule> PointRules => Set<PointRule>();
    public DbSet<PointTransaction> PointTransactions => Set<PointTransaction>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<LeaveApprovalHistory> LeaveApprovalHistories => Set<LeaveApprovalHistory>();
    public DbSet<EmployeePersonalLocation> EmployeePersonalLocations => Set<EmployeePersonalLocation>();
    public DbSet<EmployeeLocationRequest> EmployeeLocationRequests => Set<EmployeeLocationRequest>();
    public DbSet<ForgotPasswordRequest> ForgotPasswordRequests => Set<ForgotPasswordRequest>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(b =>
        {
            b.Ignore(u => u.FullNameEn);
            b.Property(u => u.FullNameAr).HasMaxLength(256);
            b.Property(u => u.JobTitleAr).HasMaxLength(100);
            b.Property(u => u.DepartmentAr).HasMaxLength(100);
        });

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ICreationAuditable).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property<DateTime>(nameof(ICreationAuditable.Created_Utc))
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                modelBuilder.Entity(entityType.ClrType)
                    .Property<string>(nameof(ICreationAuditable.Created_By))
                    .HasMaxLength(450)
                    .IsRequired(false);
            }

            if (typeof(IModificationAuditable).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property<DateTime?>(nameof(IModificationAuditable.Updated_Utc))
                    .IsRequired(false);

                modelBuilder.Entity(entityType.ClrType)
                    .Property<string>(nameof(IModificationAuditable.Updated_By))
                    .HasMaxLength(450)
                    .IsRequired(false);
            }
        }
    }
}
