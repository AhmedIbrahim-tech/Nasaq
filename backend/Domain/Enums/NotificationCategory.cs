using System.Text.Json.Serialization;

namespace Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NotificationCategory
{
    Info = 1,
    Success = 2,
    Warning = 3,
    Error = 4,
    Attendance = 5,
    Leaves = 6,
    Points = 7,
    Schedules = 8,
    System = 9
}

