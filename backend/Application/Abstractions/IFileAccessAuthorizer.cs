namespace Application.Abstractions;

public interface IFileAccessAuthorizer
{
    Task<bool> CanAccessAsync(FileCategory category, Guid ownerId, bool isWrite, CancellationToken cancellationToken = default);
}
