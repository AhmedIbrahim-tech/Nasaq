using Microsoft.Extensions.Logging.Abstractions;
using Tests.Fakes;

namespace Tests.Files;

public class FileStorageTests : IAsyncLifetime, IDisposable
{
    private readonly TestFixture _fixture;
    private readonly string _tempStorageDirectory;
    private readonly StorageOptions _storageOptions;
    private readonly IOptions<StorageOptions> _optionsWrapper;
    private readonly FileService _fileService;
    private readonly FileValidationService _validationService;

    public FileStorageTests()
    {
        _fixture = new TestFixture();
        _tempStorageDirectory = Path.Combine(Path.GetTempPath(), "NASAQ_Test_Storage_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_tempStorageDirectory);

        _storageOptions = new StorageOptions
        {
            RootPath = _tempStorageDirectory,
            MaxFileSizeBytes = 1024 * 1024, // 1 MB limit for tests
            MaxFilesPerUpload = 5,
            AllowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx", ".xlsx"]
        };
        _optionsWrapper = Options.Create(_storageOptions);

        _fileService = new FileService(_optionsWrapper, NullLogger<FileService>.Instance);
        _validationService = new FileValidationService(_optionsWrapper);
    }

    public async Task InitializeAsync()
    {
        await _fixture.InitializeAsync();
    }

    public Task DisposeAsync()
    {
        Dispose();
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _fixture.Dispose();

        try
        {
            if (Directory.Exists(_tempStorageDirectory))
            {
                Directory.Delete(_tempStorageDirectory, recursive: true);
            }
        }
        catch
        {
            // Best effort cleanup of temp directory
        }
    }

    private static byte[] CreateValidPdfBytes() =>
        [0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3];

    private static byte[] CreateValidJpegBytes() =>
        [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46];

    private static byte[] CreateValidPngBytes() =>
        [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D];

    private static byte[] CreateValidWebpBytes() =>
        [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20];

    private static byte[] CreateValidDocxBytes()
    {
        using var ms = new MemoryStream();
        using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            var contentTypes = archive.CreateEntry("[Content_Types].xml");
            using (var writer = new StreamWriter(contentTypes.Open()))
            {
                writer.Write("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"></Types>");
            }

            var document = archive.CreateEntry("word/document.xml");
            using (var writer = new StreamWriter(document.Open()))
            {
                writer.Write("<?xml version=\"1.0\" encoding=\"UTF-8\"?><w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body/></w:document>");
            }
        }
        return ms.ToArray();
    }

    private static byte[] CreateValidXlsxBytes()
    {
        using var ms = new MemoryStream();
        using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            var contentTypes = archive.CreateEntry("[Content_Types].xml");
            using (var writer = new StreamWriter(contentTypes.Open()))
            {
                writer.Write("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"></Types>");
            }

            var workbook = archive.CreateEntry("xl/workbook.xml");
            using (var writer = new StreamWriter(workbook.Open()))
            {
                writer.Write("<?xml version=\"1.0\" encoding=\"UTF-8\"?><workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"></workbook>");
            }
        }
        return ms.ToArray();
    }

    private static byte[] CreateArbitraryZipBytes()
    {
        using var ms = new MemoryStream();
        using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            var entry = archive.CreateEntry("payload.txt");
            using var writer = new StreamWriter(entry.Open());
            writer.Write("Arbitrary non-OpenXML text content inside a zip archive.");
        }
        return ms.ToArray();
    }

    private static byte[] CreateZipBombBytes(int entryCount)
    {
        using var ms = new MemoryStream();
        using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            for (var i = 0; i < entryCount; i++)
            {
                var entry = archive.CreateEntry($"bomb_entry_{i}.txt");
                using var writer = new StreamWriter(entry.Open());
                writer.Write("A");
            }
        }
        return ms.ToArray();
    }

    private sealed class NonSeekableMemoryStream(byte[] buffer) : MemoryStream(buffer)
    {
        public override bool CanSeek => false;

        public override long Position
        {
            get => base.Position;
            set => throw new NotSupportedException("Non-seekable stream cannot set position.");
        }

        public override long Seek(long offset, SeekOrigin loc) =>
            throw new NotSupportedException("Non-seekable stream cannot seek.");
    }

    private sealed class ThrowingDbContext(DbContextOptions<ApplicationDbContext> options) : ApplicationDbContext(options)
    {
        public bool ShouldThrow { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            if (ShouldThrow)
            {
                throw new DbUpdateException("Simulated database failure during metadata save.");
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }

    #region 1. Functional Tests (BUG-01 & BUG-02)

    [Fact]
    public async Task Supervisor_CanAccessOwnEmployeeFiles()
    {
        var supervisorEmp = _fixture.SupervisorAEmp;
        var supAContext = _fixture.CreateUserContext(_fixture.SupervisorAUser, RoleNames.Supervisor);
        var authorizer = new FileAccessAuthorizer(_fixture.DbContext, supAContext);

        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var adminAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);
        var uploadHandler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            adminAuthorizer,
            adminContext,
            _optionsWrapper);

        var uploadResult = await uploadHandler.Handle(
            new UploadFilesCommand(FileCategory.Employees, supervisorEmp.Id,
            [
                new FileUploadModel
                {
                    Content = new MemoryStream(CreateValidPdfBytes()),
                    FileName = "supervisor_contract.pdf",
                    ContentType = "application/pdf",
                    Length = CreateValidPdfBytes().Length
                }
            ]),
            CancellationToken.None);

        Assert.True(uploadResult.Succeeded);
        var fileId = uploadResult.Data![0].Id;

        // Supervisor A accesses their OWN file
        var downloadHandler = new DownloadFileHandler(
            _fixture.DbContext,
            _fileService,
            authorizer,
            _validationService);

        var downloadResult = await downloadHandler.Handle(new DownloadFileQuery(fileId), CancellationToken.None);

        Assert.True(downloadResult.Succeeded);
        Assert.NotNull(downloadResult.Data);
        Assert.Equal("supervisor_contract.pdf", downloadResult.Data.OriginalFileName);
    }

    [Fact]
    public async Task Supervisor_CanAccessAssignedEmployees_AndDeniedUnassignedOrOtherSupervisorEmployees()
    {
        var emp1 = _fixture.Employee1; // Assigned to Supervisor A
        var emp2 = _fixture.Employee2; // Assigned to Supervisor B
        var unassigned = _fixture.UnassignedEmp; // No supervisor

        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var adminAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);
        var uploadHandler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            adminAuthorizer,
            adminContext,
            _optionsWrapper);

        var upload1 = await uploadHandler.Handle(
            new UploadFilesCommand(FileCategory.Employees, emp1.Id,
            [
                new FileUploadModel
                {
                    Content = new MemoryStream(CreateValidPdfBytes()),
                    FileName = "emp1.pdf",
                    ContentType = "application/pdf",
                    Length = CreateValidPdfBytes().Length
                }
            ]),
            CancellationToken.None);

        var upload2 = await uploadHandler.Handle(
            new UploadFilesCommand(FileCategory.Employees, emp2.Id,
            [
                new FileUploadModel
                {
                    Content = new MemoryStream(CreateValidPdfBytes()),
                    FileName = "emp2.pdf",
                    ContentType = "application/pdf",
                    Length = CreateValidPdfBytes().Length
                }
            ]),
            CancellationToken.None);

        var supAContext = _fixture.CreateUserContext(_fixture.SupervisorAUser, RoleNames.Supervisor);
        var supAAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, supAContext);
        var downloadHandler = new DownloadFileHandler(
            _fixture.DbContext,
            _fileService,
            supAAuthorizer,
            _validationService);

        // Assigned subordinate -> Allowed
        var res1 = await downloadHandler.Handle(new DownloadFileQuery(upload1.Data![0].Id), CancellationToken.None);
        Assert.True(res1.Succeeded);

        // Subordinate assigned to Supervisor B -> Forbidden
        var res2 = await downloadHandler.Handle(new DownloadFileQuery(upload2.Data![0].Id), CancellationToken.None);
        Assert.False(res2.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, res2.StatusCode);

        // Unassigned employee -> Forbidden
        var canAccessUnassigned = await supAAuthorizer.CanAccessAsync(FileCategory.Employees, unassigned.Id, false);
        Assert.False(canAccessUnassigned);
    }

    [Fact]
    public async Task Admin_And_SuperAdmin_DeniedUnsupportedCategories_FailClosed()
    {
        var superAdminContext = _fixture.CreateUserContext(_fixture.SuperAdminUser, RoleNames.SuperAdmin);
        var superAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, superAdminContext);

        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var adminAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        var testGuid = Guid.NewGuid();

        // LeaveRequests and OtherDocuments must fail-closed for ALL roles, including SuperAdmin and Admin
        Assert.False(await superAuthorizer.CanAccessAsync(FileCategory.LeaveRequests, testGuid, true));
        Assert.False(await superAuthorizer.CanAccessAsync(FileCategory.LeaveRequests, testGuid, false));
        Assert.False(await superAuthorizer.CanAccessAsync(FileCategory.OtherDocuments, testGuid, true));
        Assert.False(await superAuthorizer.CanAccessAsync(FileCategory.OtherDocuments, testGuid, false));

        Assert.False(await adminAuthorizer.CanAccessAsync(FileCategory.LeaveRequests, testGuid, true));
        Assert.False(await adminAuthorizer.CanAccessAsync(FileCategory.LeaveRequests, testGuid, false));
        Assert.False(await adminAuthorizer.CanAccessAsync(FileCategory.OtherDocuments, testGuid, true));
        Assert.False(await adminAuthorizer.CanAccessAsync(FileCategory.OtherDocuments, testGuid, false));
    }

    [Fact]
    public async Task NonexistentEmployeeOwner_RejectedForEveryRole()
    {
        var nonExistentId = Guid.NewGuid();

        var superAdminContext = _fixture.CreateUserContext(_fixture.SuperAdminUser, RoleNames.SuperAdmin);
        var superAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, superAdminContext);

        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var adminAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        var empContext = _fixture.CreateUserContext(_fixture.Employee1User, RoleNames.Employee);
        var empAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, empContext);

        Assert.False(await superAuthorizer.CanAccessAsync(FileCategory.Employees, nonExistentId, true));
        Assert.False(await superAuthorizer.CanAccessAsync(FileCategory.Employees, nonExistentId, false));
        Assert.False(await adminAuthorizer.CanAccessAsync(FileCategory.Employees, nonExistentId, true));
        Assert.False(await empAuthorizer.CanAccessAsync(FileCategory.Employees, nonExistentId, false));

        var uploadHandler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            adminAuthorizer,
            adminContext,
            _optionsWrapper);

        var res = await uploadHandler.Handle(
            new UploadFilesCommand(FileCategory.Employees, nonExistentId,
            [
                new FileUploadModel
                {
                    Content = new MemoryStream(CreateValidPdfBytes()),
                    FileName = "doc.pdf",
                    ContentType = "application/pdf",
                    Length = CreateValidPdfBytes().Length
                }
            ]),
            CancellationToken.None);

        Assert.False(res.Succeeded);
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    #endregion

    #region 2. Security Tests (SEC-01, SEC-02, SEC-03)

    [Fact]
    public async Task MimeSpoofing_DangerousClientContentTypes_AreRejected()
    {
        var dangerousMimeTypes = new[]
        {
            "text/html",
            "application/javascript",
            "text/javascript",
            "application/x-msdownload",
            "application/x-sh",
            "application/x-bat"
        };

        foreach (var badMime in dangerousMimeTypes)
        {
            var file = new FileUploadModel
            {
                Content = new MemoryStream(CreateValidPngBytes()),
                FileName = "valid_image.png",
                ContentType = badMime,
                Length = CreateValidPngBytes().Length
            };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _validationService.ValidateFileAsync(file));

            Assert.Contains("rejected as potentially unsafe", ex.Message, StringComparison.OrdinalIgnoreCase);
        }
    }

    [Fact]
    public async Task CanonicalMimeType_IsResolvedAndPersisted_IgnoringClientNoise()
    {
        var targetEmployee = _fixture.Employee1;
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var authorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        var uploadHandler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            authorizer,
            adminContext,
            _optionsWrapper);

        var uploadResult = await uploadHandler.Handle(
            new UploadFilesCommand(FileCategory.Employees, targetEmployee.Id,
            [
                new FileUploadModel
                {
                    Content = new MemoryStream(CreateValidPngBytes()),
                    FileName = "photo.png",
                    ContentType = "image/png; charset=utf-8",
                    Length = CreateValidPngBytes().Length
                }
            ]),
            CancellationToken.None);

        Assert.True(uploadResult.Succeeded);
        var storedId = uploadResult.Data![0].Id;

        var storedInDb = await _fixture.DbContext.StoredFiles.FindAsync(storedId);
        Assert.NotNull(storedInDb);
        // Persisted content type MUST be the strict canonical MIME type
        Assert.Equal("image/png", storedInDb.ContentType);

        // Download MUST return canonical MIME type
        var downloadHandler = new DownloadFileHandler(
            _fixture.DbContext,
            _fileService,
            authorizer,
            _validationService);

        var downloadResult = await downloadHandler.Handle(new DownloadFileQuery(storedId), CancellationToken.None);
        Assert.True(downloadResult.Succeeded);
        Assert.Equal("image/png", downloadResult.Data!.ContentType);
    }

    [Fact]
    public async Task OpenXml_ValidDocxAndXlsxPackages_PassValidation()
    {
        var docxBytes = CreateValidDocxBytes();
        var xlsxBytes = CreateValidXlsxBytes();

        var docxModel = new FileUploadModel
        {
            Content = new MemoryStream(docxBytes),
            FileName = "ValidDocument.docx",
            ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            Length = docxBytes.Length
        };

        var xlsxModel = new FileUploadModel
        {
            Content = new MemoryStream(xlsxBytes),
            FileName = "ValidSpreadsheet.xlsx",
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            Length = xlsxBytes.Length
        };

        var docxMime = await _validationService.ValidateFileAsync(docxModel);
        Assert.Equal("application/vnd.openxmlformats-officedocument.wordprocessingml.document", docxMime);

        var xlsxMime = await _validationService.ValidateFileAsync(xlsxModel);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsxMime);
    }

    [Fact]
    public async Task OpenXml_ArbitraryZipRenamedToDocxOrXlsx_IsRejected()
    {
        var arbitraryZipBytes = CreateArbitraryZipBytes();

        var fakeDocx = new FileUploadModel
        {
            Content = new MemoryStream(arbitraryZipBytes),
            FileName = "fake_document.docx",
            ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            Length = arbitraryZipBytes.Length
        };

        var exDocx = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _validationService.ValidateFileAsync(fakeDocx));

        Assert.Contains("missing '[Content_Types].xml'", exDocx.Message, StringComparison.OrdinalIgnoreCase);

        var fakeXlsx = new FileUploadModel
        {
            Content = new MemoryStream(arbitraryZipBytes),
            FileName = "fake_sheet.xlsx",
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            Length = arbitraryZipBytes.Length
        };

        var exXlsx = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _validationService.ValidateFileAsync(fakeXlsx));

        Assert.Contains("missing '[Content_Types].xml'", exXlsx.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task OpenXml_MalformedPackage_IsRejected()
    {
        var malformedBytes = new byte[] { 0x50, 0x4B, 0x03, 0x04, 0xDE, 0xAD, 0xBE, 0xEF, 0x01, 0x02, 0x03 };

        var malformedDocx = new FileUploadModel
        {
            Content = new MemoryStream(malformedBytes),
            FileName = "corrupt.docx",
            ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            Length = malformedBytes.Length
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _validationService.ValidateFileAsync(malformedDocx));

        Assert.Contains("Corrupt or invalid OpenXML archive package", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task OpenXml_ArchiveResourceExhaustion_ExcessiveEntriesRejected()
    {
        var bombBytes = CreateZipBombBytes(550); // Exceeds 500 entry limit

        var bombModel = new FileUploadModel
        {
            Content = new MemoryStream(bombBytes),
            FileName = "bomb.docx",
            ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            Length = bombBytes.Length
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _validationService.ValidateFileAsync(bombModel));

        Assert.Contains("exceeds maximum allowed entries limit", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task StoredFileName_PathTraversalAndSeparatorAttacks_AreRejected()
    {
        var ownerId = Guid.NewGuid();
        var content = new MemoryStream(CreateValidPdfBytes());

        var maliciousFileNames = new[]
        {
            "../escape.pdf",
            "..\\escape.pdf",
            "folder/sub.pdf",
            "folder\\sub.pdf",
            "/absolute.pdf",
            "C:\\Windows\\system32.pdf",
            "subdir/../../evil.pdf"
        };

        foreach (var badName in maliciousFileNames)
        {
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _fileService.SaveAsync(FileCategory.Employees, ownerId, badName, content));

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _fileService.CommitStagedFileAsync("dummy.tmp", FileCategory.Employees, ownerId, badName));
        }
    }

    #endregion

    #region 3. Architecture & Reliability Tests (ARC-01, ARC-02, ARC-03)

    [Fact]
    public async Task MultiFileUpload_ExceedingMaxFileCount_FailsValidation()
    {
        var targetEmployee = _fixture.Employee1;
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var authorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        var handler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            authorizer,
            adminContext,
            _optionsWrapper);

        // MaxFilesPerUpload is configured to 5 in test constructor. Provide 6 files.
        var sixFiles = Enumerable.Range(1, 6).Select(i => new FileUploadModel
        {
            Content = new MemoryStream(CreateValidPdfBytes()),
            FileName = $"file_{i}.pdf",
            ContentType = "application/pdf",
            Length = CreateValidPdfBytes().Length
        }).ToList();

        var result = await handler.Handle(
            new UploadFilesCommand(FileCategory.Employees, targetEmployee.Id, sixFiles),
            CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
        Assert.Contains("Cannot upload more than", result.Message);
    }

    [Fact]
    public async Task MultiFileUpload_AllOrNothingRollback_WhenOneFileFailsValidation()
    {
        var targetEmployee = _fixture.Employee1;
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var authorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        var handler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            authorizer,
            adminContext,
            _optionsWrapper);

        // File 1 is valid, File 2 has an invalid signature (text file disguised as PDF)
        var file1 = new FileUploadModel
        {
            Content = new MemoryStream(CreateValidPdfBytes()),
            FileName = "valid.pdf",
            ContentType = "application/pdf",
            Length = CreateValidPdfBytes().Length
        };

        var file2 = new FileUploadModel
        {
            Content = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("Not a valid PDF")),
            FileName = "invalid.pdf",
            ContentType = "application/pdf",
            Length = 15
        };

        var result = await handler.Handle(
            new UploadFilesCommand(FileCategory.Employees, targetEmployee.Id, [file1, file2]),
            CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);

        // Verify zero files exist in the owner's directory
        var ownerDir = Path.Combine(_tempStorageDirectory, "Employees", targetEmployee.Id.ToString());
        if (Directory.Exists(ownerDir))
        {
            Assert.Empty(Directory.GetFiles(ownerDir));
        }

        // Verify staging directory is cleaned up
        var stagingRoot = Path.Combine(_tempStorageDirectory, ".staging");
        if (Directory.Exists(stagingRoot))
        {
            Assert.Empty(Directory.GetDirectories(stagingRoot));
        }
    }

    [Fact]
    public async Task DatabasePersistenceFailure_CleansUpAllPhysicalFiles()
    {
        var targetEmployee = _fixture.Employee1;
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var authorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        // Setup a dbContext that throws on SaveChangesAsync
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var throwingContext = new ThrowingDbContext(options);
        // Seed employee into throwingContext
        throwingContext.Employees.Add(new Employee
        {
            Id = targetEmployee.Id,
            EmployeeCode = targetEmployee.EmployeeCode,
            FirstName = targetEmployee.FirstName,
            LastName = targetEmployee.LastName,
            Email = targetEmployee.Email,
            HireDate = DateTime.UtcNow
        });
        await ((ApplicationDbContext)throwingContext).SaveChangesAsync();
        throwingContext.ShouldThrow = true;

        var handler = new UploadFilesHandler(
            throwingContext,
            _fileService,
            _validationService,
            authorizer,
            adminContext,
            _optionsWrapper);

        var file = new FileUploadModel
        {
            Content = new MemoryStream(CreateValidPdfBytes()),
            FileName = "rollback_test.pdf",
            ContentType = "application/pdf",
            Length = CreateValidPdfBytes().Length
        };

        await Assert.ThrowsAsync<DbUpdateException>(() =>
            handler.Handle(
                new UploadFilesCommand(FileCategory.Employees, targetEmployee.Id, [file]),
                CancellationToken.None));

        // Verify all committed physical files were rolled back and deleted
        var ownerDir = Path.Combine(_tempStorageDirectory, "Employees", targetEmployee.Id.ToString());
        if (Directory.Exists(ownerDir))
        {
            Assert.Empty(Directory.GetFiles(ownerDir));
        }
    }

    [Fact]
    public async Task NonSeekableStream_UploadsSuccessfully_WithoutByteLoss()
    {
        var targetEmployee = _fixture.Employee1;
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var authorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        var handler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            authorizer,
            adminContext,
            _optionsWrapper);

        var pdfBytes = CreateValidPdfBytes();
        var nonSeekableStream = new NonSeekableMemoryStream(pdfBytes);

        var uploadResult = await handler.Handle(
            new UploadFilesCommand(FileCategory.Employees, targetEmployee.Id,
            [
                new FileUploadModel
                {
                    Content = nonSeekableStream,
                    FileName = "stream_test.pdf",
                    ContentType = "application/pdf",
                    Length = pdfBytes.Length
                }
            ]),
            CancellationToken.None);

        Assert.True(uploadResult.Succeeded);
        var fileId = uploadResult.Data![0].Id;

        var downloadHandler = new DownloadFileHandler(
            _fixture.DbContext,
            _fileService,
            authorizer,
            _validationService);

        var downloadResult = await downloadHandler.Handle(new DownloadFileQuery(fileId), CancellationToken.None);
        Assert.True(downloadResult.Succeeded);

        await using var downloadedStream = downloadResult.Data!.Stream;
        using var readMs = new MemoryStream();
        await downloadedStream.CopyToAsync(readMs);

        Assert.Equal(pdfBytes, readMs.ToArray());
    }

    [Fact]
    public async Task UnauthorizedUser_DeniedDownloadAndMetadata()
    {
        var emp1 = _fixture.Employee1;
        var emp2 = _fixture.Employee2;

        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var adminAuthorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        var uploadHandler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            adminAuthorizer,
            adminContext,
            _optionsWrapper);

        var upload = await uploadHandler.Handle(
            new UploadFilesCommand(FileCategory.Employees, emp1.Id,
            [
                new FileUploadModel
                {
                    Content = new MemoryStream(CreateValidPdfBytes()),
                    FileName = "confidential.pdf",
                    ContentType = "application/pdf",
                    Length = CreateValidPdfBytes().Length
                }
            ]),
            CancellationToken.None);

        var fileId = upload.Data![0].Id;

        // Employee 2 tries to download Employee 1's file -> Forbidden
        var emp2Context = _fixture.CreateUserContext(_fixture.Employee2User, RoleNames.Employee);
        var emp2Authorizer = new FileAccessAuthorizer(_fixture.DbContext, emp2Context);

        var downloadHandler = new DownloadFileHandler(
            _fixture.DbContext,
            _fileService,
            emp2Authorizer,
            _validationService);

        var downloadResult = await downloadHandler.Handle(new DownloadFileQuery(fileId), CancellationToken.None);
        Assert.False(downloadResult.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, downloadResult.StatusCode);

        // Employee 2 tries to get metadata for Employee 1's file -> Forbidden
        var metadataHandler = new GetFileMetadataHandler(
            _fixture.DbContext,
            emp2Authorizer);

        var metadataResult = await metadataHandler.Handle(new GetFileMetadataQuery(fileId), CancellationToken.None);
        Assert.False(metadataResult.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, metadataResult.StatusCode);

        // Employee 2 tries to list Employee 1's files -> Forbidden
        var listHandler = new GetFilesByOwnerHandler(
            _fixture.DbContext,
            emp2Authorizer);

        var listResult = await listHandler.Handle(
            new GetFilesByOwnerQuery(FileCategory.Employees, emp1.Id),
            CancellationToken.None);

        Assert.False(listResult.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, listResult.StatusCode);
    }

    #endregion

    #region 4. Direct Provider & Additional Tests

    [Fact]
    public async Task StorageProvider_SaveAsync_CreatesCorrectDirectoryStructureAndFile()
    {
        var ownerId = Guid.NewGuid();
        var storedName = $"{Guid.NewGuid():D}.pdf";
        var content = new MemoryStream(CreateValidPdfBytes());

        var relativePath = await _fileService.SaveAsync(
            FileCategory.Employees,
            ownerId,
            storedName,
            content);

        Assert.Equal($"Employees/{ownerId}/{storedName}", relativePath);

        var expectedPhysicalPath = Path.Combine(_tempStorageDirectory, "Employees", ownerId.ToString(), storedName);
        Assert.True(File.Exists(expectedPhysicalPath));

        var exists = await _fileService.ExistsAsync(relativePath);
        Assert.True(exists);

        await using var readStream = await _fileService.ReadAsync(relativePath);
        Assert.NotNull(readStream);
        Assert.Equal(CreateValidPdfBytes().Length, readStream.Length);
    }

    [Fact]
    public async Task StorageProvider_PathTraversal_AttemptsThrowException()
    {
        var traversalPaths = new[]
        {
            "../../escape.txt",
            "Employees/../../windows/system32/cmd.exe",
            "../outside.pdf",
            "..\\..\\escape.txt"
        };

        foreach (var path in traversalPaths)
        {
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _fileService.ReadAsync(path));

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _fileService.DeleteAsync(path));

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _fileService.ExistsAsync(path));
        }
    }

    [Fact]
    public async Task StorageProvider_MissingPhysicalFile_ReturnsNullStream()
    {
        var relativePath = $"Employees/{Guid.NewGuid()}/{Guid.NewGuid()}.pdf";
        var stream = await _fileService.ReadAsync(relativePath);

        Assert.Null(stream);
    }

    [Fact]
    public async Task ValidationService_EmptyFile_ThrowsInvalidOperationException()
    {
        var emptyFile = new FileUploadModel
        {
            Content = new MemoryStream(),
            FileName = "empty.pdf",
            ContentType = "application/pdf",
            Length = 0
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _validationService.ValidateFileAsync(emptyFile));

        Assert.Contains("empty", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ValidationService_OversizedFile_ThrowsInvalidOperationException()
    {
        var oversizedLength = _storageOptions.MaxFileSizeBytes + 10;
        var oversizedFile = new FileUploadModel
        {
            Content = new MemoryStream(CreateValidPdfBytes()),
            FileName = "huge.pdf",
            ContentType = "application/pdf",
            Length = oversizedLength
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _validationService.ValidateFileAsync(oversizedFile));

        Assert.Contains("exceeds the maximum allowed size", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ValidationService_InvalidExtension_ThrowsInvalidOperationException()
    {
        var exeFile = new FileUploadModel
        {
            Content = new MemoryStream(CreateValidPdfBytes()),
            FileName = "malicious.exe",
            ContentType = "application/x-msdownload",
            Length = 100
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _validationService.ValidateFileAsync(exeFile));

        Assert.Contains("not permitted", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ValidationService_InvalidSignature_FailsClosed()
    {
        var fakePdfBytes = System.Text.Encoding.UTF8.GetBytes("This is plain text pretending to be a PDF");
        var fakePdfFile = new FileUploadModel
        {
            Content = new MemoryStream(fakePdfBytes),
            FileName = "fake.pdf",
            ContentType = "application/pdf",
            Length = fakePdfBytes.Length
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _validationService.ValidateFileAsync(fakePdfFile));

        Assert.Contains("signature mismatch", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Upload_DuplicateOriginalNames_SucceedsWithoutCollisions()
    {
        var targetEmployee = _fixture.Employee1;
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var authorizer = new FileAccessAuthorizer(_fixture.DbContext, adminContext);

        var handler = new UploadFilesHandler(
            _fixture.DbContext,
            _fileService,
            _validationService,
            authorizer,
            adminContext,
            _optionsWrapper);

        var duplicateName = "Document.pdf";
        var file1 = new FileUploadModel
        {
            Content = new MemoryStream(CreateValidPdfBytes()),
            FileName = duplicateName,
            ContentType = "application/pdf",
            Length = CreateValidPdfBytes().Length
        };
        var file2 = new FileUploadModel
        {
            Content = new MemoryStream(CreateValidPdfBytes()),
            FileName = duplicateName,
            ContentType = "application/pdf",
            Length = CreateValidPdfBytes().Length
        };

        var result = await handler.Handle(
            new UploadFilesCommand(FileCategory.Employees, targetEmployee.Id, [file1, file2]),
            CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.Equal(2, result.Data!.Count);

        var stored1 = await _fixture.DbContext.StoredFiles.FindAsync(result.Data[0].Id);
        var stored2 = await _fixture.DbContext.StoredFiles.FindAsync(result.Data[1].Id);

        Assert.NotNull(stored1);
        Assert.NotNull(stored2);
        Assert.Equal(duplicateName, stored1.OriginalFileName);
        Assert.Equal(duplicateName, stored2.OriginalFileName);
        Assert.NotEqual(stored1.StoredFileName, stored2.StoredFileName);

        Assert.True(await _fileService.ExistsAsync(stored1.RelativePath));
        Assert.True(await _fileService.ExistsAsync(stored2.RelativePath));
    }

    #endregion
}
