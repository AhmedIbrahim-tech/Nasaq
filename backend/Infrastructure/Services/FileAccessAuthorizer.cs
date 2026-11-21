namespace Infrastructure.Services;

public sealed class FileAccessAuthorizer(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser)
    : IFileAccessAuthorizer
{
    public async Task<bool> CanAccessAsync(
        FileCategory category,
        Guid ownerId,
        bool isWrite,
        CancellationToken cancellationToken = default)
    {
        if (category == FileCategory.LeaveRequests)
        {
            var leaveOwner = await dbContext.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == ownerId, cancellationToken);

            if (leaveOwner == null)
            {
                return false;
            }

            if (currentUser.IsSuperAdmin || currentUser.IsAdmin)
            {
                return true;
            }

            // Self-ownership: employee can upload and read their own leave attachments
            if (!string.IsNullOrEmpty(currentUser.UserId) && leaveOwner.UserId == currentUser.UserId)
            {
                return true;
            }

            // Read-only for supervisors reviewing team members
            if (!isWrite && currentUser.IsSupervisor)
            {
                var currentSupervisor = await dbContext.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.UserId == currentUser.UserId, cancellationToken);

                return currentSupervisor != null && leaveOwner.SupervisorId == currentSupervisor.Id;
            }

            return false;
        }

        if (category != FileCategory.Employees)
        {
            return false;
        }

        // Verify owner record existence for Employees for every role, including administrators
        var employee = await dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == ownerId, cancellationToken);

        if (employee == null)
        {
            return false;
        }

        // Administrators have full access once owner existence and category validity are established
        if (currentUser.IsSuperAdmin || currentUser.IsAdmin)
        {
            return true;
        }

        // Write operations (upload/delete) on employee files require Admin or SuperAdmin
        if (isWrite)
        {
            return false;
        }

        // BUG-01 Fix: Check self-ownership FIRST so that supervisors can access their own files
        if (!string.IsNullOrEmpty(currentUser.UserId) && employee.UserId == currentUser.UserId)
        {
            return true;
        }

        // Supervisor subordinate access: supervisors can view their directly assigned employees
        if (currentUser.IsSupervisor)
        {
            var currentSupervisor = await dbContext.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == currentUser.UserId, cancellationToken);

            return currentSupervisor != null && employee.SupervisorId == currentSupervisor.Id;
        }

        return false;
    }
}
