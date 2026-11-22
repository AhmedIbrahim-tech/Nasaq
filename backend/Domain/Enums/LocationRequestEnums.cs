namespace Domain.Enums;

public enum LocationRequestType
{
    InitialRegistration = 1,
    Change = 2
}

public enum LocationRequestStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4,
    Superseded = 5
}

public enum PasswordRecoveryStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4
}
