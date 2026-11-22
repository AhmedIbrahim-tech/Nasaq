namespace Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<ApplicationUser> Users { get; }
    DbSet<ApplicationRole> Roles { get; }
    DbSet<IdentityUserRole<string>> UserRoles { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<AppNotification> AppNotifications { get; }
    DbSet<Employee> Employees { get; }
    DbSet<StoredFile> StoredFiles { get; }
    DbSet<WorkLocation> WorkLocations { get; }
    DbSet<WorkShift> WorkShifts { get; }
    DbSet<WorkSchedule> WorkSchedules { get; }
    DbSet<WorkScheduleDay> WorkScheduleDays { get; }
    DbSet<EmployeeScheduleAssignment> EmployeeScheduleAssignments { get; }
    DbSet<AttendanceRecord> AttendanceRecords { get; }
    DbSet<PointRule> PointRules { get; }
    DbSet<PointTransaction> PointTransactions { get; }
    DbSet<LeaveType> LeaveTypes { get; }
    DbSet<LeaveRequest> LeaveRequests { get; }
    DbSet<LeaveApprovalHistory> LeaveApprovalHistories { get; }
    DbSet<EmployeePersonalLocation> EmployeePersonalLocations { get; }
    DbSet<EmployeeLocationRequest> EmployeeLocationRequests { get; }
    DbSet<ForgotPasswordRequest> ForgotPasswordRequests { get; }
    DbSet<SystemSetting> SystemSettings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;
}
