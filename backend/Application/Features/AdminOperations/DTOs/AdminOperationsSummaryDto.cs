namespace Application.Features.AdminOperations.DTOs;

public class AdminOperationsSummaryDto
{
    public int PendingGpsExceptionsCount { get; set; }
    public int IncompleteAttendanceCount { get; set; }
    public int TodayTotalAttendance { get; set; }
    public int TodayVerifiedCount { get; set; }
    public int TodayPendingCount { get; set; }
    public int TodayRejectedCount { get; set; }
}
