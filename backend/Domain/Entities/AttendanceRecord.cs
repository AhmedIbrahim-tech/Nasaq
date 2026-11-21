namespace Domain.Entities;

public class AttendanceRecord : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid EmployeeId { get; set; }
    public virtual Employee? Employee { get; set; }

    public DateOnly Date { get; set; }

    public Guid? WorkLocationId { get; set; }
    public virtual WorkLocation? WorkLocation { get; set; }

    public Guid? WorkShiftId { get; set; }
    public virtual WorkShift? WorkShift { get; set; }

    // --- Check-in Details ---
    public DateTime CheckInTimeUtc { get; set; }
    public double? CheckInLatitude { get; set; }
    public double? CheckInLongitude { get; set; }
    public double? CheckInAccuracyMeters { get; set; }
    public double? CheckInDistanceMeters { get; set; }
    public VerificationStatus CheckInStatus { get; set; } = VerificationStatus.Verified;
    public string? CheckInFailureReason { get; set; }
    public ArrivalClassification ArrivalClassification { get; set; } = ArrivalClassification.Standard;

    // --- Check-out Details ---
    public DateTime? CheckOutTimeUtc { get; set; }
    public double? CheckOutLatitude { get; set; }
    public double? CheckOutLongitude { get; set; }
    public double? CheckOutAccuracyMeters { get; set; }
    public double? CheckOutDistanceMeters { get; set; }
    public VerificationStatus CheckOutStatus { get; set; } = VerificationStatus.NotRecorded;
    public string? CheckOutFailureReason { get; set; }

    // --- Aggregate Status & Duration ---
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public int? DurationMinutes { get; set; }

    // --- Device Information & Notes ---
    public string? CheckInDeviceInfo { get; set; }
    public string? CheckOutDeviceInfo { get; set; }
    public string? Notes { get; set; }

    // --- Administrative Review ---
    public bool IsManuallyAdjusted { get; set; } = false;
    public string? ReviewNotes { get; set; }
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }

    // --- Audit Fields ---
    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
