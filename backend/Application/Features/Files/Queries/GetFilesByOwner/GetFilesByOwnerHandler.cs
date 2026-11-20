namespace Application.Features.Files.Queries.GetFilesByOwner;

public sealed class GetFilesByOwnerHandler(
    IApplicationDbContext dbContext,
    IFileAccessAuthorizer accessAuthorizer)
    : IRequestHandler<GetFilesByOwnerQuery, GenericBaseResponse<IReadOnlyList<StoredFileDto>>>
{
    public async Task<GenericBaseResponse<IReadOnlyList<StoredFileDto>>> Handle(
        GetFilesByOwnerQuery request,
        CancellationToken cancellationToken)
    {
        var canAccess = await accessAuthorizer.CanAccessAsync(
            request.Category,
            request.OwnerId,
            isWrite: false,
            cancellationToken);

        if (!canAccess)
        {
            return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.Fail(
                "Access denied: You do not have permission to view files for this record.",
                HttpStatusCode.Forbidden);
        }

        var files = await dbContext.StoredFiles
            .AsNoTracking()
            .Where(f => f.Category == request.Category && f.OwnerId == request.OwnerId)
            .OrderByDescending(f => f.UploadedAtUtc)
            .Select(f => new StoredFileDto
            {
                Id = f.Id,
                Category = f.Category.ToString(),
                OwnerId = f.OwnerId,
                OriginalFileName = f.OriginalFileName,
                ContentType = f.ContentType,
                FileSize = f.FileSize,
                UploadedAtUtc = f.UploadedAtUtc,
                UploadedBy = f.UploadedBy
            })
            .ToListAsync(cancellationToken);

        return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.Success(files);
    }
}
