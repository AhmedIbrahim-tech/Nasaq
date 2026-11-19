namespace Domain.DTOs.Lookups;

public sealed record LookupOptionDto
{
    public string Value { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string? Code { get; init; }
    public string? Description { get; init; }
    public bool IsActive { get; init; } = true;
}
