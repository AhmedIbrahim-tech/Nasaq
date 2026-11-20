namespace Infrastructure.Services;

public sealed class FileService(
    IOptions<StorageOptions> options,
    IFileValidationService validationService,
    IApplicationDbContext dbContext,
    ICurrentUser currentUser,
    ILogger<FileService> logger)
    : IFileService
{
    private readonly StorageOptions _options = options.Value;
    private readonly string _storageRoot = InitializeStorageRoot(options.Value.RootPath);

    private static string InitializeStorageRoot(string? configuredRoot)
    {
        if (string.IsNullOrWhiteSpace(configuredRoot))
        {
            configuredRoot = "NASAQ_Storage";
        }

        var canonicalRoot = Path.GetFullPath(configuredRoot);
        if (!Directory.Exists(canonicalRoot))
        {
            Directory.CreateDirectory(canonicalRoot);
        }

        return canonicalRoot;
    }

    public async Task<StoredFile> SaveAsync(
        IFormFile file,
        FileCategory category,
        Guid ownerId,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            throw new ArgumentException("Uploaded file cannot be null or empty.", nameof(file));
        }

        var batchId = Guid.NewGuid();
        string? committedPath = null;
        try
        {
            await using var stream = file.OpenReadStream();
            var staged = await StageFileAsync(
                batchId,
                file.FileName,
                stream,
                _options.MaxFileSizeBytes,
                cancellationToken);

            string canonicalMime;
            await using (var stagedStream = new FileStream(
                staged.StagingPath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                bufferSize: 81920,
                useAsync: true))
            {
                canonicalMime = await validationService.ValidateFileStreamAsync(
                    staged.SanitizedOriginalFileName,
                    stagedStream,
                    staged.ActualLength,
                    file.ContentType,
                    cancellationToken);
            }

            var storedFileName = $"{Guid.NewGuid():D}{staged.Extension}";
            committedPath = await CommitStagedFileAsync(
                staged.StagingPath,
                category,
                ownerId,
                storedFileName,
                cancellationToken);

            var storedFile = new StoredFile
            {
                Id = Guid.NewGuid(),
                Category = category,
                OwnerId = ownerId,
                OriginalFileName = staged.SanitizedOriginalFileName,
                StoredFileName = storedFileName,
                RelativePath = committedPath,
                ContentType = canonicalMime,
                FileSize = staged.ActualLength,
                UploadedAtUtc = DateTime.UtcNow,
                UploadedBy = currentUser.UserName ?? currentUser.UserId ?? "System"
            };

            await dbContext.StoredFiles.AddAsync(storedFile, cancellationToken);

            return storedFile;
        }
        catch (Exception ex)
        {
            if (committedPath != null)
            {
                try
                {
                    await DeleteAsync(committedPath, CancellationToken.None);
                }
                catch (Exception deleteEx)
                {
                    logger.LogWarning(deleteEx, "Failed to clean up committed physical file '{Path}' after save failure.", committedPath);
                }
            }

            throw;
        }
        finally
        {
            await CleanupStagingBatchAsync(batchId, CancellationToken.None);
        }
    }

    public Task<Stream?> ReadAsync(string relativePath, CancellationToken cancellationToken = default)
    {
        var physicalPath = ResolveSafePhysicalPath(relativePath);
        if (!File.Exists(physicalPath))
        {
            return Task.FromResult<Stream?>(null);
        }

        Stream stream = new FileStream(
            physicalPath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read,
            bufferSize: 81920,
            useAsync: true);

        return Task.FromResult<Stream?>(stream);
    }

    public Task<bool> DeleteAsync(string relativePath, CancellationToken cancellationToken = default)
    {
        var physicalPath = ResolveSafePhysicalPath(relativePath);
        if (!File.Exists(physicalPath))
        {
            return Task.FromResult(false);
        }

        File.Delete(physicalPath);
        return Task.FromResult(true);
    }

    public Task<bool> ExistsAsync(string relativePath, CancellationToken cancellationToken = default)
    {
        var physicalPath = ResolveSafePhysicalPath(relativePath);
        return Task.FromResult(File.Exists(physicalPath));
    }

    private async Task<StagedFileResult> StageFileAsync(
        Guid batchId,
        string originalFileName,
        Stream content,
        long maxSizeBytes,
        CancellationToken cancellationToken = default)
    {
        var sanitizedName = SanitizeFileName(originalFileName);
        if (string.IsNullOrWhiteSpace(sanitizedName))
        {
            throw new InvalidOperationException("File name cannot be empty or contain only invalid characters.");
        }

        var stagingDir = Path.Combine(_storageRoot, ".staging", batchId.ToString("N"));
        var canonicalStagingDir = Path.GetFullPath(stagingDir);
        EnsurePathInsideRoot(canonicalStagingDir);

        if (!Directory.Exists(canonicalStagingDir))
        {
            Directory.CreateDirectory(canonicalStagingDir);
        }

        var tempStagedPath = Path.Combine(canonicalStagingDir, $"{Guid.NewGuid():N}.tmp");

        try
        {
            long totalBytesWritten = 0;
            var buffer = new byte[81920];

            await using (var fileStream = new FileStream(
                tempStagedPath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 81920,
                useAsync: true))
            {
                int read;
                while ((read = await content.ReadAsync(buffer, 0, buffer.Length, cancellationToken)) > 0)
                {
                    totalBytesWritten += read;
                    if (totalBytesWritten > maxSizeBytes)
                    {
                        throw new InvalidOperationException(
                            $"File '{sanitizedName}' exceeds the maximum allowed size of {maxSizeBytes} bytes.");
                    }

                    await fileStream.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
                }

                await fileStream.FlushAsync(cancellationToken);
            }

            if (totalBytesWritten <= 0)
            {
                throw new InvalidOperationException($"File '{sanitizedName}' is empty.");
            }

            var extension = Path.GetExtension(sanitizedName).ToLowerInvariant();
            return new StagedFileResult(tempStagedPath, sanitizedName, extension, totalBytesWritten);
        }
        catch
        {
            if (File.Exists(tempStagedPath))
            {
                try
                {
                    File.Delete(tempStagedPath);
                }
                catch (Exception cleanupEx)
                {
                    logger.LogWarning(cleanupEx, "Failed to clean up aborted staging file: {TempPath}", tempStagedPath);
                }
            }

            throw;
        }
    }

    private Task<string> CommitStagedFileAsync(
        string stagingPath,
        FileCategory category,
        Guid ownerId,
        string storedFileName,
        CancellationToken cancellationToken = default)
    {
        ValidateSingleFileName(storedFileName);

        if (!File.Exists(stagingPath))
        {
            throw new FileNotFoundException("Staged file was not found.", stagingPath);
        }

        var categoryName = category.ToString();
        var ownerFolder = ownerId.ToString();

        var targetDirectory = Path.Combine(_storageRoot, categoryName, ownerFolder);
        var canonicalTargetDir = Path.GetFullPath(targetDirectory);

        EnsurePathInsideRoot(canonicalTargetDir);

        if (!Directory.Exists(canonicalTargetDir))
        {
            Directory.CreateDirectory(canonicalTargetDir);
        }

        var destinationPhysicalPath = Path.Combine(canonicalTargetDir, storedFileName);
        var canonicalDestPath = Path.GetFullPath(destinationPhysicalPath);

        EnsurePathInsideTargetDir(canonicalDestPath, canonicalTargetDir);
        EnsurePathInsideRoot(canonicalDestPath);

        if (File.Exists(canonicalDestPath))
        {
            throw new InvalidOperationException($"A file with physical name '{storedFileName}' already exists.");
        }

        File.Move(stagingPath, canonicalDestPath, overwrite: false);

        var relativePath = $"{categoryName}/{ownerFolder}/{storedFileName}";
        return Task.FromResult(relativePath);
    }

    private Task CleanupStagingBatchAsync(Guid batchId, CancellationToken cancellationToken = default)
    {
        var stagingDir = Path.Combine(_storageRoot, ".staging", batchId.ToString("N"));
        if (Directory.Exists(stagingDir))
        {
            try
            {
                Directory.Delete(stagingDir, recursive: true);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to clean up staging directory for batch {BatchId}", batchId);
            }
        }

        return Task.CompletedTask;
    }

    private string ResolveSafePhysicalPath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            throw new ArgumentException("Relative path cannot be empty.", nameof(relativePath));
        }

        var normalized = relativePath.Replace('/', Path.DirectorySeparatorChar)
                                     .Replace('\\', Path.DirectorySeparatorChar)
                                     .TrimStart(Path.DirectorySeparatorChar);

        var combined = Path.Combine(_storageRoot, normalized);
        var canonicalPath = Path.GetFullPath(combined);

        EnsurePathInsideRoot(canonicalPath);

        return canonicalPath;
    }

    private void EnsurePathInsideRoot(string canonicalPath)
    {
        var rootWithSeparator = _storageRoot.EndsWith(Path.DirectorySeparatorChar)
            ? _storageRoot
            : _storageRoot + Path.DirectorySeparatorChar;

        if (!canonicalPath.StartsWith(rootWithSeparator, StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(canonicalPath, _storageRoot, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Path traversal attempt detected. Access denied.");
        }
    }

    private static void EnsurePathInsideTargetDir(string canonicalPath, string canonicalTargetDir)
    {
        var targetDirWithSeparator = canonicalTargetDir.EndsWith(Path.DirectorySeparatorChar)
            ? canonicalTargetDir
            : canonicalTargetDir + Path.DirectorySeparatorChar;

        if (!canonicalPath.StartsWith(targetDirWithSeparator, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Path traversal attempt detected. Destination path escapes the owner directory.");
        }
    }

    private static void ValidateSingleFileName(string storedFileName)
    {
        if (string.IsNullOrWhiteSpace(storedFileName))
        {
            throw new ArgumentException("Stored file name cannot be empty.", nameof(storedFileName));
        }

        if (storedFileName.IndexOfAny([Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar, '/', '\\']) >= 0 ||
            Path.GetFileName(storedFileName) != storedFileName ||
            Path.IsPathRooted(storedFileName) ||
            storedFileName.Contains(".."))
        {
            throw new InvalidOperationException(
                "Stored file name must be a single file name and cannot contain path separators or traversal sequences.");
        }
    }

    private static string SanitizeFileName(string fileName)
    {
        var nameWithoutPath = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(nameWithoutPath))
        {
            return string.Empty;
        }

        var chars = nameWithoutPath.Where(c => !char.IsControl(c)).ToArray();
        return new string(chars).Trim();
    }

    private sealed record StagedFileResult(
        string StagingPath,
        string SanitizedOriginalFileName,
        string Extension,
        long ActualLength);
}
