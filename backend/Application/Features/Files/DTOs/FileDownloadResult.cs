namespace Application.Features.Files.DTOs;

public class FileDownloadResult
{
    public required Stream Stream { get; init; }

    public required string ContentType { get; init; }

    public required string OriginalFileName { get; init; }

    public required long FileSize { get; init; }
}
