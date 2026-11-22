using Domain.Enums;

namespace Application.Features.Auth.DTOs;

public class ForgotPasswordRequestDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public Guid? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string? EmployeeNameAr { get; set; }
    public string? EmployeeCode { get; set; }
    public string Email { get; set; } = string.Empty;
    public PasswordRecoveryStatus Status { get; set; }
    public DateTime RequestedAtUtc { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
    public string? ReviewedBy { get; set; }
    public string? RejectionReason { get; set; }
}
