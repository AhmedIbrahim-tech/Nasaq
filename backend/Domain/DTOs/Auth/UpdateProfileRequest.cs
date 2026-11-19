namespace Domain.DTOs.Auth;

public sealed record UpdateProfileRequest
{
    public string? FullName { get; init; }
    public string? PhoneNumber { get; init; }
    public string? JobTitle { get; init; }
    public string? Department { get; init; }
}
