namespace Domain.Enums;

public enum AttendanceStatus
{
    Present = 1,          // Currently checked in, session in progress
    Completed = 2,        // Checked in and checked out successfully
    PendingReview = 3,    // Check-in or check-out has GPS/location exception awaiting review
    Incomplete = 4,       // Shift expired without check-out
    Rejected = 5          // Administrative review rejected the attendance
}

public enum VerificationStatus
{
    NotRecorded = 0,
    Verified = 1,         // Valid GPS inside geofence
    PendingReview = 2,    // Outside geofence, low accuracy, or GPS unavailable
    Rejected = 3          // Administrator rejected this operation
}

public enum ArrivalClassification
{
    Standard = 0,        // No shift windows configured, standard check-in
    Early = 1,           // Arrived during early window
    OnTime = 2,          // Arrived on-time
    Late = 3,            // Arrived after late threshold
    AfterCutoff = 4      // Arrived between cutoff and shift end (Black Card notice)
}
