using Domain.Entities;
using Domain.Enums;

namespace Application.Features.Attendance.DTOs;

public class AttendanceRecordDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeNameAr { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? DepartmentAr { get; set; }

    public DateOnly Date { get; set; }

    public Guid? WorkLocationId { get; set; }
    public string? WorkLocationName { get; set; }
    public string? WorkLocationNameAr { get; set; }

    public Guid? WorkShiftId { get; set; }
    public string? WorkShiftName { get; set; }
    public string? WorkShiftNameAr { get; set; }
    public bool IsOvernightShift { get; set; }

    // Check-in
    public DateTime CheckInTimeUtc { get; set; }
    public double? CheckInLatitude { get; set; }
    public double? CheckInLongitude { get; set; }
    public double? CheckInAccuracyMeters { get; set; }
    public double? CheckInDistanceMeters { get; set; }
    public string CheckInStatus { get; set; } = string.Empty;
    public string? CheckInFailureReason { get; set; }
    public string ArrivalClassification { get; set; } = string.Empty;

    // Check-out
    public DateTime? CheckOutTimeUtc { get; set; }
    public double? CheckOutLatitude { get; set; }
    public double? CheckOutLongitude { get; set; }
    public double? CheckOutAccuracyMeters { get; set; }
    public double? CheckOutDistanceMeters { get; set; }
    public string CheckOutStatus { get; set; } = string.Empty;
    public string? CheckOutFailureReason { get; set; }

    // Aggregate
    public string Status { get; set; } = string.Empty;
    public int? DurationMinutes { get; set; }
    public double? DurationHours => DurationMinutes.HasValue ? Math.Round(DurationMinutes.Value / 60.0, 2) : null;

    // Devices & Notes
    public string? CheckInDeviceInfo { get; set; }
    public string? CheckOutDeviceInfo { get; set; }
    public string? Notes { get; set; }

    // Review & Audit
    public bool IsManuallyAdjusted { get; set; }
    public string? ReviewNotes { get; set; }
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }

    public DateTime Created_Utc { get; set; }

    public static AttendanceRecordDto FromEntity(AttendanceRecord record) => FromEntity(record, null);

    public static AttendanceRecordDto FromEntity(AttendanceRecord record, string? language)
    {
        var isAr = language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true;
        return new AttendanceRecordDto
        {
            Id = record.Id,
            EmployeeId = record.EmployeeId,
            EmployeeName = isAr
                ? (record.Employee?.FullNameAr ?? record.Employee?.FullName ?? string.Empty)
                : (record.Employee?.FullName ?? string.Empty),
            EmployeeNameAr = record.Employee?.FullNameAr,
            EmployeeCode = record.Employee?.EmployeeCode ?? string.Empty,
            Department = isAr
                ? (record.Employee?.DepartmentAr ?? record.Employee?.Department)
                : record.Employee?.Department,
            DepartmentAr = record.Employee?.DepartmentAr,
            Date = record.Date,
            WorkLocationId = record.WorkLocationId,
            WorkLocationName = isAr
                ? (record.WorkLocation?.NameAr ?? record.WorkLocation?.Name)
                : record.WorkLocation?.Name,
            WorkLocationNameAr = record.WorkLocation?.NameAr,
            WorkShiftId = record.WorkShiftId,
            WorkShiftName = isAr
                ? (record.WorkShift?.NameAr ?? record.WorkShift?.Name)
                : record.WorkShift?.Name,
            WorkShiftNameAr = record.WorkShift?.NameAr,
            IsOvernightShift = record.WorkShift?.IsOvernight ?? false,

            CheckInTimeUtc = record.CheckInTimeUtc,
            CheckInLatitude = record.CheckInLatitude,
            CheckInLongitude = record.CheckInLongitude,
            CheckInAccuracyMeters = record.CheckInAccuracyMeters,
            CheckInDistanceMeters = record.CheckInDistanceMeters,
            CheckInStatus = record.CheckInStatus.ToString(),
            CheckInFailureReason = record.CheckInFailureReason,
            ArrivalClassification = record.ArrivalClassification.ToString(),

            CheckOutTimeUtc = record.CheckOutTimeUtc,
            CheckOutLatitude = record.CheckOutLatitude,
            CheckOutLongitude = record.CheckOutLongitude,
            CheckOutAccuracyMeters = record.CheckOutAccuracyMeters,
            CheckOutDistanceMeters = record.CheckOutDistanceMeters,
            CheckOutStatus = record.CheckOutStatus.ToString(),
            CheckOutFailureReason = record.CheckOutFailureReason,

            Status = record.Status.ToString(),
            DurationMinutes = record.DurationMinutes,

            CheckInDeviceInfo = record.CheckInDeviceInfo,
            CheckOutDeviceInfo = record.CheckOutDeviceInfo,
            Notes = record.Notes,

            IsManuallyAdjusted = record.IsManuallyAdjusted,
            ReviewNotes = record.ReviewNotes,
            ReviewedBy = record.ReviewedBy,
            ReviewedAtUtc = record.ReviewedAtUtc,

            Created_Utc = record.Created_Utc
        };
    }
}
