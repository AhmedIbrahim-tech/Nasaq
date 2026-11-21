using Microsoft.Extensions.Logging.Abstractions;
using Tests.Fakes;

namespace Tests.Files;

public class EmployeeProfilePhotoTests : IAsyncLifetime, IDisposable
{
    private readonly TestFixture _fixture;
    private readonly string _tempStorageDirectory;
    private readonly StorageOptions _storageOptions;
    private readonly IOptions<StorageOptions> _optionsWrapper;
    private readonly FileService _fileService;
    private FakeCurrentUser _adminContext = null!;

    public EmployeeProfilePhotoTests()
    {
        _fixture = new TestFixture();
        _tempStorageDirectory = Path.Combine(Path.GetTempPath(), "NASAQ_ProfilePhotoTests_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_tempStorageDirectory);

        _storageOptions = new StorageOptions
        {
            RootPath = _tempStorageDirectory,
            MaxFileSizeBytes = 1024 * 1024, // 1 MB limit for tests
            MaxFilesPerUpload = 5,
            AllowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx", ".xlsx"]
        };
        _optionsWrapper = Options.Create(_storageOptions);
        var valService = new FileValidationService(_optionsWrapper);
        _fileService = new FileService(_optionsWrapper, valService, _fixture.DbContext, new FakeCurrentUser(), NullLogger<FileService>.Instance);
    }

    public async Task InitializeAsync()
    {
        await _fixture.InitializeAsync();
        _adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
    }

    public Task DisposeAsync()
    {
        Dispose();
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _fixture.Dispose();
        if (Directory.Exists(_tempStorageDirectory))
        {
            try
            {
                Directory.Delete(_tempStorageDirectory, recursive: true);
            }
            catch
            {
            }
        }
    }

    private CreateEmployeeHandler CreateHandler()
    {
        return new CreateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fileService,
            _adminContext,
            _fixture.UserManager,
            _fixture.RoleManager,
            _fixture.PasswordService);
    }

    private UpdateEmployeeHandler CreateUpdateHandler()
    {
        return new UpdateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fileService,
            _adminContext,
            _fixture.UserManager,
            _fixture.RoleManager);
    }

    private static FormFile CreateFormFile(byte[] content, string fileName, string contentType)
    {
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, content.Length, "profilePhoto", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    private static byte[] CreateValidJpegBytes(int length = 256)
    {
        var bytes = new byte[Math.Max(length, 10)];
        bytes[0] = 0xFF;
        bytes[1] = 0xD8;
        bytes[2] = 0xFF;
        bytes[3] = 0xE0;
        for (int i = 4; i < bytes.Length; i++)
        {
            bytes[i] = (byte)(i % 250);
        }
        return bytes;
    }

    private static byte[] CreateValidPngBytes(int length = 256)
    {
        var bytes = new byte[Math.Max(length, 16)];
        bytes[0] = 0x89;
        bytes[1] = 0x50;
        bytes[2] = 0x4E;
        bytes[3] = 0x47;
        bytes[4] = 0x0D;
        bytes[5] = 0x0A;
        bytes[6] = 0x1A;
        bytes[7] = 0x0A;
        for (int i = 8; i < bytes.Length; i++)
        {
            bytes[i] = (byte)(i % 250);
        }
        return bytes;
    }

    [Fact]
    public async Task CreateEmployee_WithoutPhoto_SucceedsAndProfilePhotoIsNull()
    {
        var handler = CreateHandler();
        var code = "EMP-NO-PHOTO-" + Guid.NewGuid().ToString("N")[..6];
        var command = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Sarah",
            LastName: "Connor",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000001",
            Department: "Operations",
            JobTitle: "Lead Operator",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: null);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Data);
        Assert.Null(response.Data.ProfilePhoto);

        var saved = await _fixture.DbContext.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == code);
        Assert.NotNull(saved);
        Assert.Null(saved.ProfilePhoto);

        var fileCount = await _fixture.DbContext.StoredFiles.CountAsync(f => f.OwnerId == saved.Id);
        Assert.Equal(0, fileCount);
    }

    [Fact]
    public async Task CreateEmployee_WithValidJpegPhoto_SucceedsAndStoresMetadataAndPhysicalFile()
    {
        var handler = CreateHandler();
        var code = "EMP-JPEG-" + Guid.NewGuid().ToString("N")[..6];
        var jpegBytes = CreateValidJpegBytes(512);
        var formFile = CreateFormFile(jpegBytes, "profile-headshot.jpg", "image/jpeg");

        var command = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "John",
            LastName: "Doe",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000002",
            Department: "Photography",
            JobTitle: "Photographer",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: formFile);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded, response.Message);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Data);
        Assert.NotNull(response.Data.ProfilePhoto);

        var employeeId = response.Data.Id;
        var savedEmployee = await _fixture.DbContext.Employees.FirstOrDefaultAsync(e => e.Id == employeeId);
        Assert.NotNull(savedEmployee);
        Assert.Equal(response.Data.ProfilePhoto, savedEmployee.ProfilePhoto);

        var storedFile = await _fixture.DbContext.StoredFiles.FirstOrDefaultAsync(f => f.Id == savedEmployee.ProfilePhoto);
        Assert.NotNull(storedFile);
        Assert.Equal(FileCategory.Employees, storedFile.Category);
        Assert.Equal(employeeId, storedFile.OwnerId);
        Assert.Equal("profile-headshot.jpg", storedFile.OriginalFileName);
        Assert.Equal("image/jpeg", storedFile.ContentType);
        Assert.Equal(jpegBytes.Length, storedFile.FileSize);

        Assert.True(await _fileService.ExistsAsync(storedFile.RelativePath));
        await using var readStream = await _fileService.ReadAsync(storedFile.RelativePath);
        Assert.NotNull(readStream);
        using var ms = new MemoryStream();
        await readStream.CopyToAsync(ms);
        Assert.Equal(jpegBytes, ms.ToArray());
    }

    [Fact]
    public async Task CreateEmployee_WithValidPngPhoto_Succeeds()
    {
        var handler = CreateHandler();
        var code = "EMP-PNG-" + Guid.NewGuid().ToString("N")[..6];
        var pngBytes = CreateValidPngBytes(1024);
        var formFile = CreateFormFile(pngBytes, "avatar.png", "image/png");

        var command = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Alice",
            LastName: "Smith",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000003",
            Department: "Editing",
            JobTitle: "Editor",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: formFile);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded);
        Assert.NotNull(response.Data?.ProfilePhoto);

        var storedFile = await _fixture.DbContext.StoredFiles.FirstOrDefaultAsync(f => f.Id == response.Data.ProfilePhoto);
        Assert.NotNull(storedFile);
        Assert.Equal("image/png", storedFile.ContentType);
        Assert.True(await _fileService.ExistsAsync(storedFile.RelativePath));
    }

    [Fact]
    public async Task CreateEmployee_WithInvalidFileSignature_FailsValidationAndRollsBackEmployeeAndCleansUp()
    {
        var handler = CreateHandler();
        var code = "EMP-BAD-SIG-" + Guid.NewGuid().ToString("N")[..6];
        var fakeBytes = "THIS IS NOT A VALID JPEG OR PNG FILE"u8.ToArray();
        var formFile = CreateFormFile(fakeBytes, "fake.jpg", "image/jpeg");

        var command = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Malicious",
            LastName: "Actor",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: null,
            Department: "Finance",
            JobTitle: "Auditor",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: formFile);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var employee = await _fixture.DbContext.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == code);
        Assert.Null(employee);

        var storedFiles = await _fixture.DbContext.StoredFiles.ToListAsync();
        Assert.DoesNotContain(storedFiles, f => f.OriginalFileName == "fake.jpg");

        var stagingRoot = Path.Combine(_tempStorageDirectory, ".staging");
        if (Directory.Exists(stagingRoot))
        {
            var stagingSubdirs = Directory.GetDirectories(stagingRoot);
            Assert.Empty(stagingSubdirs);
        }
    }

    [Fact]
    public async Task CreateEmployee_WithDisallowedExtension_FailsValidationAndRollsBack()
    {
        var handler = CreateHandler();
        var code = "EMP-BAD-EXT-" + Guid.NewGuid().ToString("N")[..6];
        var dummyBytes = new byte[100];
        var formFile = CreateFormFile(dummyBytes, "script.exe", "application/x-msdownload");

        var command = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Hacker",
            LastName: "Bob",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: null,
            Department: "IT",
            JobTitle: "Engineer",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: formFile);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var employee = await _fixture.DbContext.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == code);
        Assert.Null(employee);
    }

    [Fact]
    public async Task CreateEmployee_ExceedingMaxFileSize_FailsValidationAndDoesNotPersistEmployee()
    {
        var handler = CreateHandler();
        var code = "EMP-OVERSIZE-" + Guid.NewGuid().ToString("N")[..6];
        var hugeBytes = new byte[2 * 1024 * 1024]; // 2 MB > 1 MB limit
        var formFile = CreateFormFile(hugeBytes, "huge.jpg", "image/jpeg");

        var command = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Heavy",
            LastName: "Upload",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: null,
            Department: "Warehouse",
            JobTitle: "Clerk",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: formFile);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var employee = await _fixture.DbContext.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == code);
        Assert.Null(employee);
    }

    [Fact]
    public async Task UpdateEmployee_WithNewPhoto_ReplacesOldPhotoAndDeletesOldFilePostCommit()
    {
        var createHandler = CreateHandler();
        var updateHandler = CreateUpdateHandler();
        var code = "EMP-UPD-PHOTO-" + Guid.NewGuid().ToString("N")[..6];

        var oldJpegBytes = CreateValidJpegBytes(512);
        var oldFile = CreateFormFile(oldJpegBytes, "old-photo.jpg", "image/jpeg");

        var createCommand = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "David",
            LastName: "Beckham",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000010",
            Department: "Sports",
            JobTitle: "Coach",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: oldFile);

        var createResult = await createHandler.Handle(createCommand, CancellationToken.None);
        Assert.True(createResult.Succeeded);
        var employeeId = createResult.Data!.Id;
        var oldPhotoId = createResult.Data.ProfilePhoto!.Value;

        var oldStoredFile = await _fixture.DbContext.StoredFiles.FirstAsync(f => f.Id == oldPhotoId);
        var oldRelativePath = oldStoredFile.RelativePath;
        Assert.True(await _fileService.ExistsAsync(oldRelativePath));

        // Update with new PNG photo
        var newPngBytes = CreateValidPngBytes(1024);
        var newFile = CreateFormFile(newPngBytes, "new-photo.png", "image/png");

        var updateCommand = new UpdateEmployeeCommand(
            Id: employeeId,
            FirstName: "David",
            LastName: "Beckham",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000010",
            Department: "Sports",
            JobTitle: "Head Coach",
            HireDate: DateTime.UtcNow.Date,
            ProfilePhoto: newFile,
            RemoveProfilePhoto: false);

        var updateResult = await updateHandler.Handle(updateCommand, CancellationToken.None);
        Assert.True(updateResult.Succeeded);
        Assert.NotNull(updateResult.Data!.ProfilePhoto);
        Assert.NotEqual(oldPhotoId, updateResult.Data.ProfilePhoto.Value);

        var newPhotoId = updateResult.Data.ProfilePhoto.Value;
        var newStoredFile = await _fixture.DbContext.StoredFiles.FirstAsync(f => f.Id == newPhotoId);
        Assert.Equal("new-photo.png", newStoredFile.OriginalFileName);
        Assert.Equal("image/png", newStoredFile.ContentType);

        // New physical file must exist
        Assert.True(await _fileService.ExistsAsync(newStoredFile.RelativePath));

        // Old physical file must be deleted post-commit
        Assert.False(await _fileService.ExistsAsync(oldRelativePath));

        // Old StoredFile record must no longer exist in db
        var oldStoredFileInDb = await _fixture.DbContext.StoredFiles.FirstOrDefaultAsync(f => f.Id == oldPhotoId);
        Assert.Null(oldStoredFileInDb);
    }

    [Fact]
    public async Task UpdateEmployee_WithRemoveProfilePhoto_ClearsPhotoAndDeletesOldFilePostCommit()
    {
        var createHandler = CreateHandler();
        var updateHandler = CreateUpdateHandler();
        var code = "EMP-REM-PHOTO-" + Guid.NewGuid().ToString("N")[..6];

        var oldJpegBytes = CreateValidJpegBytes(512);
        var oldFile = CreateFormFile(oldJpegBytes, "removable-photo.jpg", "image/jpeg");

        var createCommand = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Emma",
            LastName: "Watson",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000011",
            Department: "Arts",
            JobTitle: "Director",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: oldFile);

        var createResult = await createHandler.Handle(createCommand, CancellationToken.None);
        Assert.True(createResult.Succeeded);
        var employeeId = createResult.Data!.Id;
        var oldPhotoId = createResult.Data.ProfilePhoto!.Value;

        var oldStoredFile = await _fixture.DbContext.StoredFiles.FirstAsync(f => f.Id == oldPhotoId);
        var oldRelativePath = oldStoredFile.RelativePath;
        Assert.True(await _fileService.ExistsAsync(oldRelativePath));

        // Update with RemoveProfilePhoto = true
        var updateCommand = new UpdateEmployeeCommand(
            Id: employeeId,
            FirstName: "Emma",
            LastName: "Watson",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000011",
            Department: "Arts",
            JobTitle: "Director",
            HireDate: DateTime.UtcNow.Date,
            ProfilePhoto: null,
            RemoveProfilePhoto: true);

        var updateResult = await updateHandler.Handle(updateCommand, CancellationToken.None);
        Assert.True(updateResult.Succeeded);
        Assert.Null(updateResult.Data!.ProfilePhoto);

        var employeeInDb = await _fixture.DbContext.Employees.FirstAsync(e => e.Id == employeeId);
        Assert.Null(employeeInDb.ProfilePhoto);

        // Old physical file must be deleted post-commit
        Assert.False(await _fileService.ExistsAsync(oldRelativePath));

        // Old StoredFile record must be removed
        var oldStoredFileInDb = await _fixture.DbContext.StoredFiles.FirstOrDefaultAsync(f => f.Id == oldPhotoId);
        Assert.Null(oldStoredFileInDb);
    }

    [Fact]
    public async Task UpdateEmployee_WithContradictoryPhotoAndRemove_ReturnsBadRequest()
    {
        var createHandler = CreateHandler();
        var updateHandler = CreateUpdateHandler();
        var code = "EMP-CONTRADICT-" + Guid.NewGuid().ToString("N")[..6];

        var oldJpegBytes = CreateValidJpegBytes(512);
        var oldFile = CreateFormFile(oldJpegBytes, "original-photo.jpg", "image/jpeg");

        var createCommand = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Contradictory",
            LastName: "Test",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000012",
            Department: "QA",
            JobTitle: "Tester",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: oldFile);

        var createResult = await createHandler.Handle(createCommand, CancellationToken.None);
        Assert.True(createResult.Succeeded);
        var employeeId = createResult.Data!.Id;
        var oldPhotoId = createResult.Data.ProfilePhoto!.Value;

        var oldStoredFile = await _fixture.DbContext.StoredFiles.FirstAsync(f => f.Id == oldPhotoId);
        var oldRelativePath = oldStoredFile.RelativePath;

        // Provide both ProfilePhoto and RemoveProfilePhoto = true
        var newFile = CreateFormFile(CreateValidPngBytes(512), "contradictory.png", "image/png");
        var updateCommand = new UpdateEmployeeCommand(
            Id: employeeId,
            FirstName: "Contradictory",
            LastName: "Test",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000012",
            Department: "QA",
            JobTitle: "Tester",
            HireDate: DateTime.UtcNow.Date,
            ProfilePhoto: newFile,
            RemoveProfilePhoto: true);

        var updateResult = await updateHandler.Handle(updateCommand, CancellationToken.None);
        Assert.False(updateResult.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, updateResult.StatusCode);

        // Original photo and record must remain untouched
        Assert.True(await _fileService.ExistsAsync(oldRelativePath));
        var employeeInDb = await _fixture.DbContext.Employees.FirstAsync(e => e.Id == employeeId);
        Assert.Equal(oldPhotoId, employeeInDb.ProfilePhoto);
    }

    [Fact]
    public async Task UpdateEmployee_WithoutPhotoChange_PreservesExistingPhoto()
    {
        var createHandler = CreateHandler();
        var updateHandler = CreateUpdateHandler();
        var code = "EMP-PRESERVE-" + Guid.NewGuid().ToString("N")[..6];

        var oldJpegBytes = CreateValidJpegBytes(512);
        var oldFile = CreateFormFile(oldJpegBytes, "preserve-photo.jpg", "image/jpeg");

        var createCommand = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Preserved",
            LastName: "Photo",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000013",
            Department: "Admin",
            JobTitle: "Clerk",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: oldFile);

        var createResult = await createHandler.Handle(createCommand, CancellationToken.None);
        Assert.True(createResult.Succeeded);
        var employeeId = createResult.Data!.Id;
        var oldPhotoId = createResult.Data.ProfilePhoto!.Value;

        var oldStoredFile = await _fixture.DbContext.StoredFiles.FirstAsync(f => f.Id == oldPhotoId);
        var oldRelativePath = oldStoredFile.RelativePath;

        // Update employee details without touching photo
        var updateCommand = new UpdateEmployeeCommand(
            Id: employeeId,
            FirstName: "Preserved",
            LastName: "Renamed",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000013",
            Department: "Executive",
            JobTitle: "Senior Clerk",
            HireDate: DateTime.UtcNow.Date,
            ProfilePhoto: null,
            RemoveProfilePhoto: false);

        var updateResult = await updateHandler.Handle(updateCommand, CancellationToken.None);
        Assert.True(updateResult.Succeeded);
        Assert.Equal(oldPhotoId, updateResult.Data!.ProfilePhoto);

        // Physical file must still exist
        Assert.True(await _fileService.ExistsAsync(oldRelativePath));
    }

    [Fact]
    public async Task UpdateEmployee_OnValidationOrStorageFailure_RollsBackAndDoesNotDeleteOldPhoto()
    {
        var createHandler = CreateHandler();
        var updateHandler = CreateUpdateHandler();
        var code = "EMP-FAIL-SAFE-" + Guid.NewGuid().ToString("N")[..6];

        var oldJpegBytes = CreateValidJpegBytes(512);
        var oldFile = CreateFormFile(oldJpegBytes, "safe-photo.jpg", "image/jpeg");

        var createCommand = new CreateEmployeeCommand(
            EmployeeCode: code,
            FirstName: "Fail",
            LastName: "Safe",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000014",
            Department: "Security",
            JobTitle: "Guard",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            ProfilePhoto: oldFile);

        var createResult = await createHandler.Handle(createCommand, CancellationToken.None);
        Assert.True(createResult.Succeeded);
        var employeeId = createResult.Data!.Id;
        var oldPhotoId = createResult.Data.ProfilePhoto!.Value;

        var oldStoredFile = await _fixture.DbContext.StoredFiles.FirstAsync(f => f.Id == oldPhotoId);
        var oldRelativePath = oldStoredFile.RelativePath;

        // Attempt update with an invalid file (bad signature)
        var badFile = CreateFormFile("NOT A VALID IMAGE"u8.ToArray(), "corrupt.jpg", "image/jpeg");
        var updateCommand = new UpdateEmployeeCommand(
            Id: employeeId,
            FirstName: "Fail",
            LastName: "Safe",
            Email: $"{code.ToLowerInvariant()}@nasaq.test",
            PhoneNumber: "0100000014",
            Department: "Security",
            JobTitle: "Guard",
            HireDate: DateTime.UtcNow.Date,
            ProfilePhoto: badFile,
            RemoveProfilePhoto: false);

        var updateResult = await updateHandler.Handle(updateCommand, CancellationToken.None);
        Assert.False(updateResult.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, updateResult.StatusCode);

        // Old photo must still be intact physically and in database
        Assert.True(await _fileService.ExistsAsync(oldRelativePath));
        var employeeInDb = await _fixture.DbContext.Employees.FirstAsync(e => e.Id == employeeId);
        Assert.Equal(oldPhotoId, employeeInDb.ProfilePhoto);
    }
}
