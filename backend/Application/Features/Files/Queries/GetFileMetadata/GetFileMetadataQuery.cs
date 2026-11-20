namespace Application.Features.Files.Queries.GetFileMetadata;

public sealed record GetFileMetadataQuery(Guid FileId)
    : IRequest<GenericBaseResponse<StoredFileDto>>;
