using Domain.Entities;

namespace Application.Features.Shifts.DTOs;

public sealed record WorkShiftDto(
    Guid Id,
    string Name,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsOvernight,
    double DurationHours,
    TimeOnly? EarlyStartTime,
    TimeOnly? OnTimeStartTime,
    TimeOnly? LateStartTime,
    TimeOnly? CutoffTime,
    string? Notes,
    bool IsActive,
    DateTime Created_Utc,
    string? Created_By,
    DateTime? Updated_Utc,
    string? Updated_By,
    string? NameAr = null
)
{
    public string NameEn => Name;

    public static WorkShiftDto FromEntity(WorkShift s) => new(
        s.Id,
        s.Name,
        s.StartTime,
        s.EndTime,
        s.IsOvernight,
        s.DurationHours,
        s.EarlyStartTime,
        s.OnTimeStartTime,
        s.LateStartTime,
        s.CutoffTime,
        s.Notes,
        s.IsActive,
        s.Created_Utc,
        s.Created_By,
        s.Updated_Utc,
        s.Updated_By,
        s.NameAr
    );
}

public sealed record ShiftsSummaryDto(
    int TotalShifts,
    int ActiveShifts,
    int InactiveShifts,
    int OvernightShiftsCount,
    int DayShiftsCount
);
