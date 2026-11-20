namespace Application.Features.Files.Queries.GetFilesByOwner;

public sealed record GetFilesByOwnerQuery(
    FileCategory Category = default,
    Guid OwnerId = default)
    : IRequest<GenericBaseResponse<IReadOnlyList<StoredFileDto>>>;
