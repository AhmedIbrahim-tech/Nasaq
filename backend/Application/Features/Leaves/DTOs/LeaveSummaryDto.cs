namespace Application.Features.Leaves.DTOs;

public class LeaveSummaryDto
{
    public int TotalPending { get; set; }
    public int TotalApproved { get; set; }
    public int TotalRejected { get; set; }
    public int TotalCancelled { get; set; }

    public int MyPendingCount { get; set; }
    public int MyApprovedDaysThisYear { get; set; }
}
