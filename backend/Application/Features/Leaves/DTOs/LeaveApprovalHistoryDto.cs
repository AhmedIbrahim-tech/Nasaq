namespace Application.Features.Leaves.DTOs;

public class LeaveApprovalHistoryDto
{
    public Guid Id { get; set; }
    public Guid LeaveRequestId { get; set; }
    public string ActorId { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Comments { get; set; }
    public DateTime ActionDateUtc { get; set; }
}
