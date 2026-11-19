namespace Application.Configuration;

public sealed class FileStorageOptions
{
    public const string SectionName = "FileStorage";

    public string WebRootRelativeFolder { get; set; } = "uploads";

    public long MaxFileSizeBytes { get; set; } = 2_097_152;

    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    public string ProductsSubfolder { get; set; } = "products";

    public string GeneralSubfolder { get; set; } = "general";

    public string DocumentsSubfolder { get; set; } = "documents";
 
     public string AvatarsSubfolder { get; set; } = "avatars";
 
     public string LogosSubfolder { get; set; } = "logos";
}
