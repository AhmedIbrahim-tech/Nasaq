namespace Domain.Entities;

public class StoredFile : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public FileCategory Category { get; set; }

    public Guid OwnerId { get; set; }

    public string OriginalFileName { get; set; } = string.Empty;

    public string StoredFileName { get; set; } = string.Empty;

    public string RelativePath { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;

    public string? UploadedBy { get; set; }

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
