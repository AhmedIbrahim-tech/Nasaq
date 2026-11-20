namespace Application.Features.Files.Queries.DownloadFile;

public sealed class DownloadFileHandler(
    IApplicationDbContext dbContext,
    IFileService fileService,
    IFileAccessAuthorizer accessAuthorizer,
    IFileValidationService validationService)
    : IRequestHandler<DownloadFileQuery, GenericBaseResponse<FileDownloadResult>>
{
    public async Task<GenericBaseResponse<FileDownloadResult>> Handle(
        DownloadFileQuery request,
        CancellationToken cancellationToken)
    {
        var storedFile = await dbContext.StoredFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == request.FileId, cancellationToken);

        if (storedFile == null)
        {
            return GenericBaseResponse<FileDownloadResult>.NotFound(
                $"File with ID '{request.FileId}' was not found.");
        }

        var canAccess = await accessAuthorizer.CanAccessAsync(
            storedFile.Category,
            storedFile.OwnerId,
            isWrite: false,
            cancellationToken);

        if (!canAccess)
        {
            return GenericBaseResponse<FileDownloadResult>.Fail(
                "Access denied: You do not have permission to download this file.",
                HttpStatusCode.Forbidden);
        }

        var stream = await fileService.ReadAsync(storedFile.RelativePath, cancellationToken);
        if (stream == null)
        {
            return GenericBaseResponse<FileDownloadResult>.NotFound(
                "The requested physical file was not found on the storage server.");
        }

        var canonicalContentType = validationService.GetCanonicalMimeType(storedFile.OriginalFileName);
        var effectiveContentType = !string.IsNullOrWhiteSpace(canonicalContentType) && canonicalContentType != "application/octet-stream"
            ? canonicalContentType
            : storedFile.ContentType;

        var result = new FileDownloadResult
        {
            Stream = stream,
            ContentType = effectiveContentType,
            OriginalFileName = storedFile.OriginalFileName,
            FileSize = storedFile.FileSize
        };

        return GenericBaseResponse<FileDownloadResult>.Success(result);
    }
}
