using Domain.Entities;
using Domain.Enums;

namespace Application.Abstractions;

public record ShiftResolutionResult(
    WorkShift? Shift,
    DateOnly ShiftDate,
    ArrivalClassification Classification,
    bool IsScheduledWorkDay,
    string? NoticeMessage
);

public interface IShiftResolutionService
{
    /// <summary>
    /// Resolves the applicable work shift and arrival classification for an employee at a given UTC moment.
    /// </summary>
    Task<ShiftResolutionResult> ResolveShiftForCheckInAsync(Employee employee, DateTime utcNow, CancellationToken cancellationToken = default);
}
