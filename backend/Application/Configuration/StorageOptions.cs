namespace Application.Configuration;

public class StorageOptions
{
    public const string SectionName = "Storage";

    public string RootPath { get; set; } = "NASAQ_Storage";

    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024; // 10 MB default

    public int MaxFilesPerUpload { get; set; } = 10;

    public List<string> AllowedExtensions { get; set; } =
    [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".docx",
        ".xlsx"
    ];
}
