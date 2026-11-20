namespace Application.Features.Files.Queries.GetFileMetadata;

public sealed class GetFileMetadataHandler(
    IApplicationDbContext dbContext,
    IFileAccessAuthorizer accessAuthorizer)
    : IRequestHandler<GetFileMetadataQuery, GenericBaseResponse<StoredFileDto>>
{
    public async Task<GenericBaseResponse<StoredFileDto>> Handle(
        GetFileMetadataQuery request,
        CancellationToken cancellationToken)
    {
        var storedFile = await dbContext.StoredFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == request.FileId, cancellationToken);

        if (storedFile == null)
        {
            return GenericBaseResponse<StoredFileDto>.NotFound(
                $"File with ID '{request.FileId}' was not found.");
        }

        var canAccess = await accessAuthorizer.CanAccessAsync(
            storedFile.Category,
            storedFile.OwnerId,
            isWrite: false,
            cancellationToken);

        if (!canAccess)
        {
            return GenericBaseResponse<StoredFileDto>.Fail(
                "Access denied: You do not have permission to view metadata for this file.",
                HttpStatusCode.Forbidden);
        }

        var dto = new StoredFileDto
        {
            Id = storedFile.Id,
            Category = storedFile.Category.ToString(),
            OwnerId = storedFile.OwnerId,
            OriginalFileName = storedFile.OriginalFileName,
            ContentType = storedFile.ContentType,
            FileSize = storedFile.FileSize,
            UploadedAtUtc = storedFile.UploadedAtUtc,
            UploadedBy = storedFile.UploadedBy
        };

        return GenericBaseResponse<StoredFileDto>.Success(dto);
    }
}
