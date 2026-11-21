using Domain.Entities;

namespace Application.Abstractions;

public interface IPointCalculationEngine
{
    /// <summary>
    /// Evaluates applicable point rules for a given attendance record and returns the generated transactions (if any).
    /// Enforces policy-driven rules, deterministic arithmetic, and strict idempotency against duplicate transactions.
    /// </summary>
    Task<List<PointTransaction>> EvaluateAttendanceEventAsync(AttendanceRecord attendance, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks whether the specified employee is covered by an approved leave request on the given date.
    /// Employees on approved leave are exempt from unexcused absence penalties and disciplinary deductions.
    /// </summary>
    Task<bool> IsEmployeeOnApprovedLeaveAsync(Guid employeeId, DateOnly date, CancellationToken cancellationToken = default);
}
