namespace Application.Features.Leaves.DTOs;

public class LeaveRequestDto
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeNameAr { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? DepartmentAr { get; set; }

    public Guid LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public string LeaveTypeNameAr { get; set; } = string.Empty;
    public string LeaveTypeCode { get; set; } = string.Empty;
    public bool IsPaid { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int DaysCount { get; set; }

    public string? Reason { get; set; }
    public Guid? AttachmentFileId { get; set; }

    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAtUtc { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }
    public string? ReviewedBy { get; set; }
    public string? ReviewNotes { get; set; }

    public bool CanCancel { get; set; }
    public bool CanReview { get; set; }

    public List<LeaveApprovalHistoryDto> ApprovalHistory { get; set; } = new();
}
