namespace Application.Features.Leaves.DTOs;

public class LeaveTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get => Name; set => Name = value; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get => Description; set => Description = value; }
    public bool IsPaid { get; set; }
    public bool RequiresAttachment { get; set; }
    public int? DefaultDaysPerYear { get; set; }
    public bool IsActive { get; set; }
    public int ActiveRequestsCount { get; set; }
}
