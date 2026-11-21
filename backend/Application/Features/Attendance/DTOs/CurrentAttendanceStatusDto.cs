using Application.Features.Shifts.DTOs;

namespace Application.Features.Attendance.DTOs;

public class CurrentAttendanceStatusDto
{
    public bool IsCheckedIn { get; set; }
    public AttendanceRecordDto? ActiveAttendance { get; set; }

    public bool HasAssignedLocation { get; set; }
    public Guid? AssignedLocationId { get; set; }
    public string? AssignedLocationName { get; set; }
    public string? AssignedLocationNameAr { get; set; }
    public double? AssignedLatitude { get; set; }
    public double? AssignedLongitude { get; set; }
    public double? AssignedRadiusMeters { get; set; }
    public double? AssignedAccuracyThresholdMeters { get; set; }

    public bool HasScheduledShift { get; set; }
    public WorkShiftDto? TodayShift { get; set; }
    public bool IsScheduledWorkDay { get; set; }
    public string? ShiftNotice { get; set; }

    public bool IsOnApprovedLeave { get; set; }
    public string? ApprovedLeaveTypeName { get; set; }
    public string? ApprovedLeaveTypeNameAr { get; set; }
    public DateOnly? ApprovedLeaveStartDate { get; set; }
    public DateOnly? ApprovedLeaveEndDate { get; set; }

    public int TotalSessionsToday { get; set; }
    public double TotalHoursToday { get; set; }
}
