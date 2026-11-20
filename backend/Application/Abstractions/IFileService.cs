namespace Application.Abstractions;

public interface IFileService
{
    Task<StoredFile> SaveAsync(
        IFormFile file,
        FileCategory category,
        Guid ownerId,
        CancellationToken cancellationToken = default);

    Task<Stream?> ReadAsync(
        string relativePath,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        string relativePath,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        string relativePath,
        CancellationToken cancellationToken = default);
}
