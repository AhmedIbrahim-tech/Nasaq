namespace Application.Abstractions;

public interface ILeaveService
{
    /// <summary>
    /// Checks whether an employee has an approved leave covering the given date.
    /// Used by MOD-05 (Attendance) and MOD-06 (Points) to suppress unexcused absence penalties.
    /// </summary>
    Task<bool> IsOnApprovedLeaveAsync(Guid employeeId, DateOnly date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates the effective leave duration (in days) between StartDate and EndDate (inclusive),
    /// taking into account the employee's assigned work schedule (working days vs rest days).
    /// If no schedule is assigned, counts total inclusive calendar days.
    /// </summary>
    Task<int> CalculateLeaveDurationAsync(Guid employeeId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks whether an employee has an active (Pending or Approved) leave request overlapping the requested date range.
    /// </summary>
    Task<bool> HasOverlappingLeaveAsync(Guid employeeId, DateOnly startDate, DateOnly endDate, Guid? excludeRequestId = null, CancellationToken cancellationToken = default);
}
