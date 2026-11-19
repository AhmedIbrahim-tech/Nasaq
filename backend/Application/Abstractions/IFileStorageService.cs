using Application.Files;

namespace Application.Abstractions;

public interface IFileStorageService
{
    Task<FileStorageResult> SaveAsync(
        ReadOnlyMemory<byte> content, 
        string originalFileName,
        string? contentType,
        FileStorageCategory category,
        CancellationToken cancellationToken = default);

    Task<FileStorageResult> SaveAsync(
        Stream content,
        string originalFileName,
        string? contentType,
        FileStorageCategory category,
        CancellationToken cancellationToken = default);

    Task<FileStorageResult> SaveImageAsync(
        Stream content,
        string originalFileName,
        string? contentType,
        FileStorageCategory category,
        CancellationToken cancellationToken = default);

    Task<FileStorageResult> SaveImageAsync(
        ReadOnlyMemory<byte> content,
        string originalFileName,
        string? contentType,
        FileStorageCategory category,
        CancellationToken cancellationToken = default);

    Task DeleteIfExistsAsync(string? relativePathFromWebRoot, CancellationToken cancellationToken = default);

    string ToPublicUrlPath(string? relativePathFromWebRoot);
}
