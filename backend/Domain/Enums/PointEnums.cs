namespace Domain.Enums;

public enum PointCategory
{
    Green = 1,  // Positive performance points
    Red = 2,    // Negative disciplinary points
    Black = 3   // Severe negative compliance points
}

public enum PointEventType
{
    OnTimeArrival = 1,
    LateArrival = 2,
    AfterCutoffArrival = 3,
    EarlyDeparture = 4,
    CompletedShift = 5,
    MissingCheckOut = 6,
    GeofenceBreach = 7,
    ManualAdjustment = 8,
    EarlyArrival = 9
}

public enum PointTransactionStatus
{
    Finalized = 1,
    PendingReview = 2,
    Reversed = 3
}
