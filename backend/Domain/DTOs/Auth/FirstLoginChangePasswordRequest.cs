namespace Domain.DTOs.Auth;

public sealed class FirstLoginChangePasswordRequest
{
    public string SetupToken { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
