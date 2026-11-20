namespace Application.Features.Files.DTOs;

public class StoredFileDto
{
    public Guid Id { get; init; }

    public string Category { get; init; } = string.Empty;

    public Guid OwnerId { get; init; }

    public string OriginalFileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = string.Empty;

    public long FileSize { get; init; }

    public DateTime UploadedAtUtc { get; init; }

    public string? UploadedBy { get; init; }
}
