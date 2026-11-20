namespace Application.Abstractions;

public interface IFileValidationService
{
    Task<string> ValidateFileStreamAsync(
        string fileName,
        Stream content,
        long length,
        string? clientContentType = null,
        CancellationToken cancellationToken = default);

    string GetCanonicalMimeType(string fileName);
}
