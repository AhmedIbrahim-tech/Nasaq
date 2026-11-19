namespace Domain.DTOs.Auth;

public sealed class AuthUserResponse
{
    public string Id { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? ProfileImagePath { get; set; }
    public string? AvatarUrl { get; set; }
}
