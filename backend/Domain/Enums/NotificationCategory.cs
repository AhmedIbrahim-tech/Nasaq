using System.Text.Json.Serialization;

namespace Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NotificationCategory
{
    Info = 1,
    Success = 2,
    Warning = 3,
    Error = 4,
    Sale = 5,
    Purchase = 6,
    Expense = 7,
    BankOperation = 8,
    TreasuryOperation = 9
}

