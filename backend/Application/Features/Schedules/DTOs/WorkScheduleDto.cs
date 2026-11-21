namespace Application.Features.Schedules.DTOs;

public sealed record WorkScheduleDayDto(
    Guid Id,
    DayOfWeek DayOfWeek,
    string DayName,
    bool IsWorkingDay,
    Guid? WorkShiftId,
    string? ShiftName,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    bool? IsOvernight,
    double? DurationHours,
    string? ShiftNameAr = null
);

public sealed record WorkScheduleDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    bool IsDefault,
    IReadOnlyList<WorkScheduleDayDto> Days,
    int AssignedEmployeesCount,
    DateTime Created_Utc,
    string? Created_By,
    DateTime? Updated_Utc,
    string? Updated_By,
    string? NameAr = null,
    string? DescriptionAr = null
);

public sealed record SchedulesSummaryDto(
    int TotalSchedules,
    int ActiveSchedules,
    int InactiveSchedules,
    string? DefaultScheduleName,
    int AssignedEmployeesTotal
);

public sealed record EmployeeScheduleAssignmentDto(
    Guid Id,
    Guid EmployeeId,
    string EmployeeCode,
    string EmployeeName,
    string? Department,
    Guid WorkScheduleId,
    string ScheduleName,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    bool IsActive,
    string? Notes,
    DateTime Created_Utc,
    string? EmployeeNameAr = null,
    string? ScheduleNameAr = null,
    string? Created_By = null
);
