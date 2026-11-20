namespace Application.Features.Files.Commands.UploadFiles;

public sealed class UploadFilesHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork,
    IFileService fileService,
    IFileAccessAuthorizer accessAuthorizer,
    IOptions<StorageOptions> options,
    ILogger<UploadFilesHandler>? logger = null)
    : IRequestHandler<UploadFilesCommand, GenericBaseResponse<IReadOnlyList<StoredFileDto>>>
{
    private readonly StorageOptions _options = options.Value;

    public async Task<GenericBaseResponse<IReadOnlyList<StoredFileDto>>> Handle(
        UploadFilesCommand request,
        CancellationToken cancellationToken)
    {
        if (request.Files is null || request.Files.Count == 0)
        {
            return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.Fail(
                "At least one file must be provided for upload.",
                HttpStatusCode.BadRequest);
        }

        if (request.Files.Count > _options.MaxFilesPerUpload)
        {
            return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.Fail(
                $"Cannot upload more than {_options.MaxFilesPerUpload} files at once.",
                HttpStatusCode.BadRequest);
        }

        if (request.Category != FileCategory.Employees)
        {
            return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.Fail(
                $"File category '{request.Category}' is not currently supported.",
                HttpStatusCode.BadRequest);
        }

        var exists = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.Id == request.OwnerId, cancellationToken);

        if (!exists)
        {
            return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.NotFound(
                $"Employee record with ID '{request.OwnerId}' was not found.");
        }

        var canAccess = await accessAuthorizer.CanAccessAsync(
            request.Category,
            request.OwnerId,
            isWrite: true,
            cancellationToken);

        if (!canAccess)
        {
            return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.Fail(
                "Access denied: You do not have permission to upload files for this record.",
                HttpStatusCode.Forbidden);
        }

        var committedFiles = new List<StoredFile>();

        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            foreach (var formFile in request.Files)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var storedFile = await fileService.SaveAsync(
                    formFile,
                    request.Category,
                    request.OwnerId,
                    cancellationToken);

                committedFiles.Add(storedFile);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            await unitOfWork.CommitAsync();

            var dtos = committedFiles.Select(f => new StoredFileDto
            {
                Id = f.Id,
                Category = f.Category.ToString(),
                OwnerId = f.OwnerId,
                OriginalFileName = f.OriginalFileName,
                ContentType = f.ContentType,
                FileSize = f.FileSize,
                UploadedAtUtc = f.UploadedAtUtc,
                UploadedBy = f.UploadedBy
            }).ToList();

            return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            try
            {
                await unitOfWork.RollbackAsync();
            }
            catch (Exception rollbackEx)
            {
                logger?.LogWarning(rollbackEx, "Failed to roll back database transaction during batch file upload.");
            }

            foreach (var committedFile in committedFiles)
            {
                try
                {
                    await fileService.DeleteAsync(committedFile.RelativePath, CancellationToken.None);
                }
                catch (Exception deleteEx)
                {
                    logger?.LogWarning(deleteEx, "Failed to clean up physical file '{Path}' during batch upload rollback.", committedFile.RelativePath);
                }
            }

            if (ex is ArgumentException or InvalidOperationException)
            {
                return GenericBaseResponse<IReadOnlyList<StoredFileDto>>.Fail(ex.Message, HttpStatusCode.BadRequest);
            }

            throw;
        }
    }
}
