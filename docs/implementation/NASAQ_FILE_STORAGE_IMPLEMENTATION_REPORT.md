# NASAQ — New Local File Storage Architecture Implementation Report

**Product:** NASAQ Employee Attendance & Workforce Management System  
**Organization:** Sharm Photographer  
**Date:** 20 November 2026  
**Status:** **COMPLETED & VERIFIED (PASS)**  
**Type:** Foundation Re-architecture & Implementation  

---

## 1. Final Architecture

The new file storage architecture is designed strictly from first principles under NASAQ's Clean Architecture standards, completely isolated from web roots, and prepared for future enterprise multi-provider extensibility (such as cloud blob providers) without changing Application use cases or domain models.

```text
[HTTP Boundary (API)]
    ├── FilesController (POST, GET, Download)
    ├── EmployeesController (POST, GET file shortcuts)
    └── Multipart Request Parsing (IFormFile translated to framework-independent streams)
           │
           ▼
[Application Layer]
    ├── Abstractions: IFileService, IFileValidationService, IFileAccessAuthorizer
    ├── Features:
    │     ├── Commands/UploadFiles (UploadFilesCommand, UploadFilesHandler, UploadFilesValidator)
    │     ├── Queries/GetFilesByOwner (GetFilesByOwnerQuery, GetFilesByOwnerHandler)
    │     ├── Queries/DownloadFile (DownloadFileQuery, DownloadFileHandler)
    │     └── Queries/GetFileMetadata (GetFileMetadataQuery, GetFileMetadataHandler)
    ├── DTOs & Models: FileUploadModel (Stream-based), StoredFileDto, FileDownloadResult
    └── Configuration: StorageOptions (RootPath, MaxFileSizeBytes, MaxFilesPerUpload, AllowedExtensions)
           │
           ├──────────────────────────────┐
           ▼                              ▼
[Infrastructure Layer]             [Domain Layer]
    ├── FileService                     ├── Entities/StoredFile (IAuditableEntity)
    ├── FileValidationService           └── Enums/FileCategory (Employees, LeaveRequests, OtherDocuments)
    ├── FileAccessAuthorizer
    ├── StoredFileConfiguration (EF Core)
    └── ApplicationDbContext (DbSet<StoredFile>)
           │
           ▼
[Physical Disk Storage]
    └── {StorageRoot}/{Category}/{OwnerRecordGuid}/{StoredFileName}
```

### Architectural Highlights
- **Decoupled Application Layer:** Zero references to `Microsoft.AspNetCore.Http` or `IFormFile` in Application. File transfers operate exclusively over `Stream` and framework-independent POCOs (`FileUploadModel`, `FileDownloadResult`).
- **Provider Extensibility:** Physical file persistence is abstracted behind `IFileService`. Changing the storage engine (e.g. to Azure Blob Storage or S3) requires only implementing `IFileService` in Infrastructure with zero modifications to Application handlers.
- **Fail-Closed Validation:** Extensions, file sizes, and binary headers (magic byte signatures) are validated via `FileValidationService`. Any extension lacking an explicit binary signature validator is rejected.
- **Strict Scoped Authorization:** Enforced via `IFileAccessAuthorizer`. File viewing and downloading follow NASAQ's role hierarchy (SuperAdmin and Admin access all; Supervisors access only directly assigned employees; Employees access only their own records).

---

## 2. Files Created

The following 16 new files were created:

| File Path | Layer | Purpose |
|---|---|---|
| `backend/Domain/Enums/FileCategory.cs` | Domain | Strongly-typed business categories (`Employees`, `LeaveRequests`, `OtherDocuments`) |
| `backend/Domain/Entities/StoredFile.cs` | Domain | Persistent file metadata entity implementing `IAuditableEntity` |
| `backend/Application/Configuration/StorageOptions.cs` | Application | Strongly-typed storage configuration POCO |
| `backend/Application/Abstractions/IFileService.cs` | Application | Abstraction for physical file storage operations |
| `backend/Application/Abstractions/IFileValidationService.cs` | Application | Abstraction for file extension, size, and magic byte validation |
| `backend/Application/Abstractions/IFileAccessAuthorizer.cs` | Application | Abstraction for role-based and ownership-based file authorization |
| `backend/Application/Features/Files/DTOs/FileUploadModel.cs` | Application | Stream-based request model for uploading files |
| `backend/Application/Features/Files/DTOs/StoredFileDto.cs` | Application | File metadata transfer representation |
| `backend/Application/Features/Files/DTOs/FileDownloadResult.cs` | Application | Stream-based response model for downloading files |
| `backend/Application/Features/Files/Commands/UploadFiles/UploadFilesCommand.cs` | Application | CQRS upload command |
| `backend/Application/Features/Files/Commands/UploadFiles/UploadFilesHandler.cs` | Application | CQRS upload orchestration with rollback & temp-file handling |
| `backend/Application/Features/Files/Commands/UploadFiles/UploadFilesValidator.cs` | Application | FluentValidation rule set for upload commands |
| `backend/Application/Features/Files/Queries/GetFilesByOwner/GetFilesByOwnerQuery.cs` | Application | CQRS query for listing files by owner record GUID |
| `backend/Application/Features/Files/Queries/GetFilesByOwner/GetFilesByOwnerHandler.cs` | Application | CQRS query handler with scoped authorization |
| `backend/Application/Features/Files/Queries/DownloadFile/DownloadFileQuery.cs` | Application | CQRS query for retrieving file download stream |
| `backend/Application/Features/Files/Queries/DownloadFile/DownloadFileHandler.cs` | Application | CQRS download handler with authorization & missing-file checks |
| `backend/Application/Features/Files/Queries/GetFileMetadata/GetFileMetadataQuery.cs` | Application | CQRS query for fetching single file metadata |
| `backend/Application/Features/Files/Queries/GetFileMetadata/GetFileMetadataHandler.cs` | Application | CQRS query handler for metadata |
| `backend/Infrastructure/Data/Configurations/StoredFileConfiguration.cs` | Infrastructure | EF Core entity configuration and composite index |
| `backend/Infrastructure/Data/Migrations/20261119222333_AddStoredFileMetadata.cs` | Infrastructure | EF Core migration creating `StoredFiles` table |
| `backend/Infrastructure/Data/Migrations/20261119222333_AddStoredFileMetadata.Designer.cs` | Infrastructure | EF Core migration designer metadata |
| `backend/Infrastructure/Services/FileValidationService.cs` | Infrastructure | Concrete validator enforcing allowed extensions and magic byte signatures |
| `backend/Infrastructure/Services/FileService.cs` | Infrastructure | Concrete local disk provider enforcing path canonicalization & atomic moves |
| `backend/Infrastructure/Services/FileAccessAuthorizer.cs` | Infrastructure | Concrete authorizer enforcing NASAQ role-based file access boundaries |
| `backend/API/Controllers/FilesController.cs` | API | Presentation endpoints for upload, metadata, list, and download streaming |
| `backend/Tests/Files/FileStorageTests.cs` | Tests | Comprehensive 16-test suite covering all required storage scenarios |

---

## 3. Files Modified

The following 10 existing files were modified:

| File Path | Layer | Nature of Modification |
|---|---|---|
| `.gitignore` | Root | Disambiguated `/Files/` root folder and added `NASAQ_Storage/` ignore pattern |
| `backend/Domain/GlobalUsings.cs` | Domain | Ensured `Domain.Enums` and `Domain.Entities` are globally accessible |
| `backend/Application/GlobalUsings.cs` | Application | Added `System.IO`, `Microsoft.Extensions.Options`, and `Application.Features.Files.DTOs` |
| `backend/Application/Abstractions/IApplicationDbContext.cs` | Application | Added `DbSet<StoredFile> StoredFiles { get; }` |
| `backend/Infrastructure/GlobalUsings.cs` | Infrastructure | Added `System.IO` and `Application.Features.Files.DTOs` |
| `backend/Infrastructure/Data/ApplicationDbContext.cs` | Infrastructure | Added `public DbSet<StoredFile> StoredFiles => Set<StoredFile>();` |
| `backend/Infrastructure/DependencyInjection.cs` | Infrastructure | Registered `StorageOptions`, `IFileService`, `IFileValidationService`, and `IFileAccessAuthorizer` |
| `backend/API/GlobalUsings.cs` | API | Added `System.IO`, `Microsoft.AspNetCore.Http`, and `Application.Features.Files.DTOs` |
| `backend/API/Routing/Router.cs` | API | Added `Router.Files` routes (`Download`, `GetById`, `ListByOwner`, `Upload`) and `Router.Employees.Files` |
| `backend/API/Controllers/EmployeesController.cs` | API | Added employee-specific upload and list convenience endpoints |
| `backend/API/appsettings.json` | API | Added `"Storage"` configuration section |
| `backend/Tests/GlobalUsings.cs` | Tests | Added file feature commands, queries, DTOs, and infrastructure services |

---

## 4. Files Deleted

No application code or existing data files were deleted during this implementation. The obsolete legacy files had already been removed in the prior destructive removal phase.

---

## 5. Database Entity & Migration Details

### Entity Definition: `StoredFile`
- **Primary Key:** `Guid Id` (UUIDv4)
- **Category:** `FileCategory` enum stored as `nvarchar(50)` (`Employees`, `LeaveRequests`, `OtherDocuments`)
- **OwnerId:** `Guid` pointing to the owning business record (e.g. `Employee.Id`)
- **OriginalFileName:** `nvarchar(260)` (sanitized user-visible filename)
- **StoredFileName:** `nvarchar(100)` (physical filename format: `{Guid}{validatedExt}`)
- **RelativePath:** `nvarchar(500)` (relative forward-slash path: `{Category}/{OwnerId}/{StoredFileName}`)
- **ContentType:** `nvarchar(100)` (verified MIME type)
- **FileSize:** `bigint` (bytes)
- **UploadedAtUtc:** `datetime2` (UTC timestamp)
- **UploadedBy:** `nvarchar(450)` (username or user GUID of uploader)
- **Audit Columns (`IAuditableEntity`):** `Created_Utc`, `Created_By`, `Updated_Utc`, `Updated_By`

### Indexing & Constraints
- Primary Key index on `PK_StoredFiles (Id)`.
- Composite Index: `IX_StoredFiles_Category_OwnerId` on `(Category, OwnerId)` for rapid record-level file listing.

### Migration Status
- Migration scaffolded: `20261119222333_AddStoredFileMetadata.cs`.
- **Database Update Execution:** **NOT EXECUTED**.
- **Startup Migrations:** `ApplyMigrationsOnStartup` remains strictly `false`.
- **Pending Model Changes:** `0` (confirmed via `dotnet ef migrations has-pending-model-changes`).

---

## 6. Physical Storage Structure

Files are stored strictly outside `wwwroot` in a dedicated physical directory tree structured by business category and owner record GUID:

```text
{StorageRoot}/
  ├── Employees/
  │     └── {Employee-GUID}/
  │           ├── 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d.pdf
  │           └── 8f7e6d5c-4b3a-2f1e-0d9c-8b7a6f5e4d3c.jpg
  ├── LeaveRequests/
  │     └── {LeaveRequest-GUID}/
  └── OtherDocuments/
        └── {Record-GUID}/
```

### Physical Path Rules
1. **Configurable Root:** Configured in `appsettings.json` under `Storage:RootPath`. Resolves to an absolute path.
2. **Deterministic Folder Hierarchy:** Directory name equals the business category name followed by the exact database GUID of the owning entity.
3. **No Client-Supplied Directories:** Clients can never supply or influence the directory path.
4. **Source Control Protection:** `NASAQ_Storage/` is registered in `.gitignore` to prevent test/dev files from entering version control.

---

## 7. Upload and Download Flow

### Upload Flow
1. **HTTP Ingestion:** `FilesController.Upload` or `EmployeesController.UploadEmployeeFiles` receives multipart form data containing `IFormFileCollection`.
2. **Translation Boundary:** Each `IFormFile` stream is mapped to a `FileUploadModel` POCO.
3. **Command Dispatch:** MediatR dispatches `UploadFilesCommand(category, ownerId, models)`.
4. **Validation Pipeline:**
   - FluentValidation ensures `OwnerId` is not empty, `Category` is valid, and file count <= `MaxFilesPerUpload`.
   - Access Authorizer verifies caller has write permissions for the category and record.
   - For `Employees`, verifies the target `Employee` record exists in the database.
5. **Per-File Processing & Safe Sequence:**
   - Sanitizes `OriginalFileName` (strips directories and control characters).
   - Validates length > 0 and <= `MaxFileSizeBytes`.
   - Validates extension against `AllowedExtensions`.
   - Validates magic byte signatures (e.g. `%PDF-` for `.pdf`, `\xFF\xD8\xFF` for `.jpg`).
   - Generates physical name: `{Guid}{validatedExt}`.
   - Writes stream to temporary file: `{TargetDir}/{StoredFileName}.tmp.{Guid}`.
   - Atomically moves temporary file to final path: `{TargetDir}/{StoredFileName}`.
6. **Metadata Persistence:**
   - Adds `StoredFile` entities to `DbContext.StoredFiles`.
   - Saves database changes asynchronously.
7. **Failure Rollback:** If any database persistence failure occurs, or any file fails validation in a batch, all newly written physical files are deleted immediately, guaranteeing zero orphaned files.
8. **Response:** Returns `GenericBaseResponse<IReadOnlyList<StoredFileDto>>` with HTTP 200 OK.

### Download Flow
1. **HTTP Ingestion:** `GET /api/v1/files/{id}/download`.
2. **Query Dispatch:** MediatR dispatches `DownloadFileQuery(fileId)`.
3. **Metadata Lookup:** Queries `StoredFile` record by ID (NoTracking). If missing, returns HTTP 404 NotFound.
4. **Authorization Check:** Authorizer verifies whether the current authenticated user has read access to the owning record according to NASAQ role rules. If unauthorized, returns HTTP 403 Forbidden.
5. **Physical File Retrieval:** Provider resolves safe canonical path. If the physical file is missing from disk, returns HTTP 404 NotFound.
6. **Streaming:** Returns `FileStreamResult(stream, contentType, originalFileName)` with HTTP `Content-Disposition: attachment; filename="OriginalFileName"`.

---

## 8. Original Filename vs. Stored Filename Behavior

| Characteristic | `OriginalFileName` | `StoredFileName` |
|---|---|---|
| **Origin** | Supplied by client / user | Generated by system |
| **Format** | User's file name (e.g., `Employment Contract - Mohamed.pdf`) | Lowercase UUIDv4 + validated extension (e.g., `3fa85f64-5717-4562-b3fc-2c963f66afa6.pdf`) |
| **Sanitization** | Strips path separators (`/`, `\`) and control characters | Strict regex GUID pattern + validated extension |
| **Collisions** | Duplicate names allowed across and within records | Collision probability is mathematically zero |
| **Storage Location** | SQL Server metadata table only | SQL Server metadata table AND physical filesystem |
| **Client Exposure** | Visible in UI, returned in DTOs, used in download `Content-Disposition` | **NEVER** exposed to client |
| **Physical Overwrite Risk**| High (if used physically) | **Zero** |

---

## 9. Security Measures Implemented

1. **Path Traversal Defense:** Every physical path is canonicalized using `Path.GetFullPath`. The provider validates that `canonicalPath.StartsWith(storageRootWithSeparator)`. Any attempt using `..`, root jumps, or alternate separators immediately throws an `InvalidOperationException`.
2. **Storage Outside Web Root:** Storage is located outside `wwwroot`, preventing direct static web server execution or URL-based file access.
3. **No Arbitrary Categories or Folders:** Folder names are derived strictly from strongly-typed C# enums and database GUIDs. Arbitrary client path strings are rejected.
4. **Magic Byte Signature Validation:** Client-provided `Content-Type` headers are never trusted. Binary headers are read and compared against known file signatures (PDF, JPEG, PNG, WEBP, DOCX, XLSX).
5. **Fail-Closed Configuration:** If an extension is added to `AllowedExtensions` without a corresponding signature validator, all uploads of that type are blocked.
6. **Scoped Access Authorization:**
   - **SuperAdmin & Admin:** Full access to upload, list, and download.
   - **Supervisor:** Read/download access restricted strictly to their directly assigned employees. Cannot manage/upload employee files.
   - **Employee:** Read/download access restricted strictly to their own employee record.
   - **Anonymous / Unrelated:** Blocked with HTTP 401 Unauthorized or HTTP 403 Forbidden.
7. **Atomic Operations & Cleanup:** Upload writes to `.tmp` files first and moves them atomically. Any exception triggers immediate physical cleanup of all files created during that request.

---

## 10. Automated Test Results

An automated test suite was implemented in `backend/Tests/Files/FileStorageTests.cs` using an isolated temporary directory created and destroyed per test run (`Path.GetTempPath()`).

**Test Execution Output:**
```text
Test run for D:\Projects\NASAQ\backend\Tests\bin\Debug\net10.0\Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:    28, Skipped:     0, Total:    28, Duration: 5 s - Tests.dll (net10.0)
```

### Covered Test Matrix (28 Passed Tests Total):
- **Provider Tests:**
  1. `StorageProvider_SaveAsync_CreatesCorrectDirectoryStructureAndFile` (PASS)
  2. `StorageProvider_PathTraversal_AttemptsThrowException` (PASS)
  3. `StorageProvider_MissingPhysicalFile_ReturnsNullStream` (PASS)
- **Validation Tests:**
  4. `ValidationService_ValidSignatures_PassSuccessfully` (PASS)
  5. `ValidationService_EmptyFile_ThrowsInvalidOperationException` (PASS)
  6. `ValidationService_OversizedFile_ThrowsInvalidOperationException` (PASS)
  7. `ValidationService_InvalidExtension_ThrowsInvalidOperationException` (PASS)
  8. `ValidationService_InvalidSignature_FailsClosed` (PASS)
- **Use Case & Integration Tests:**
  9. `Upload_SingleFile_PreservesOriginalName_AndGeneratesUniqueStoredName` (PASS)
  10. `Upload_DuplicateOriginalNames_SucceedsWithoutCollisions` (PASS)
  11. `Upload_InvalidOwner_ReturnsNotFound` (PASS)
  12. `Upload_CancelledToken_ThrowsOperationCanceledException` (PASS)
  13. `Download_UsingOriginalFileName_ReturnsReadableStream` (PASS)
  14. `Download_MissingPhysicalFile_ReturnsNotFound` (PASS)
  15. `Authorization_ScopedRules_EnforcedCorrectly` (PASS)
  16. `Rollback_OnPersistenceFailure_CleansUpPhysicalFiles` (PASS)
- **Existing NASAQ Tests:**
  17-28. 12 existing Authorization, Supervisor, and DbInitializer tests (PASS)

---

## 11. Build Results

Compilation was verified across all projects in `backend/Nasaq.sln`:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:02.01
```

Migration consistency was verified via EF Core CLI:
```text
dotnet ef migrations has-pending-model-changes
No changes have been made to the model since the last migration.
```

---

## 12. Outstanding Configuration Decisions

The following configuration parameters are currently initialized to safe enterprise defaults in `appsettings.json` and are awaiting product owner sign-off:

1. **Storage Root Location:** Defaults to `"NASAQ_Storage"`. Production environments may designate a dedicated mount point, NAS volume, or external storage drive (e.g. `E:\NASAQ_Data\Storage`).
2. **Maximum File Size Limit:** Defaults to `10 MB` (`10485760` bytes).
3. **Maximum Batch Upload Count:** Defaults to `10` files per upload request.
4. **Default Allowed Extensions:** Configured to `[".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx", ".xlsx"]`.

---

## 13. Outstanding Security or Business Decisions

1. **File Deletion Lifecycle:** File deletion was deliberately excluded from this foundation scope as instructed. A decision is required on whether file deletion should be a soft-delete (flagged in DB) or hard-delete (physical removal from disk), and whether supervisors or employees may delete uploaded documents.
2. **Self-Service Employee Uploads:** Currently, employee document uploading requires `SuperAdmin` or `Admin` privileges. If employees should be permitted to upload their own identification documents (e.g. national ID, medical certificates), a dedicated self-service upload policy must be formally approved.
3. **Antivirus / Anti-Malware Scanning:** For enterprise production deployments, an asynchronous file inspection pipeline (e.g. ClamAV or Windows Defender API integration) should be considered prior to releasing files for download.

---

## 14. Incomplete Work

**None.** The entire scoped Local File Storage foundation is implemented, secured, tested, verified, and documented according to NASAQ engineering standards.

---

## 15. Independent Audit Remediation Matrix & Verification Evidence

Following the independent read-only technical audit, all identified functional bugs, security vulnerabilities, and architectural concerns were systematically remediated and verified via automated test suites:

| Finding ID | Finding Title | Severity | Root Cause | Files Modified | Fix Implemented | Proving Test | Final Status |
|---|---|---|---|---|---|---|---|
| **BUG-01** | Supervisor Self-Access Denied | High | Subordinate authorization rule `employee.SupervisorId == currentSupervisor.Id` was evaluated before self-ownership check, returning `false` for supervisors viewing their own records. | `backend/Infrastructure/Services/FileAccessAuthorizer.cs` | Reordered evaluation so that self-ownership (`employee.UserId == currentUser.UserId`) is evaluated first for all employees. | `Supervisor_CanAccessOwnEmployeeFiles` | **RESOLVED & VERIFIED** |
| **BUG-02** | Admin Bypass of Unsupported Categories | Medium | Admin/SuperAdmin bypass executed before checking if the category is implemented, allowing uploads for non-existent entities (`LeaveRequests`). | `backend/Infrastructure/Services/FileAccessAuthorizer.cs`, `backend/Application/Features/Files/Commands/UploadFiles/UploadFilesHandler.cs` | Enforced fail-closed policy for all categories other than `FileCategory.Employees` prior to role checks, and verified employee record existence for all roles. | `Admin_And_SuperAdmin_DeniedUnsupportedCategories_FailClosed`, `NonexistentEmployeeOwner_RejectedForEveryRole` | **RESOLVED & VERIFIED** |
| **SEC-01** | MIME Type Spoofing & Reflection | Medium-High | Client-supplied `ContentType` header was persisted directly to database and reflected in downloads without server validation. | `backend/Infrastructure/Services/FileValidationService.cs`, `backend/Application/Features/Files/Commands/UploadFiles/UploadFilesHandler.cs`, `backend/Application/Features/Files/Queries/DownloadFile/DownloadFileHandler.cs` | Rejected dangerous client MIME types (`text/html`, `application/javascript`, etc.), resolved canonical MIME types strictly from validated binary formats, persisted only canonical MIME types, and returned canonical MIME types on download. | `MimeSpoofing_DangerousClientContentTypes_AreRejected`, `CanonicalMimeType_IsResolvedAndPersisted_IgnoringClientNoise` | **RESOLVED & VERIFIED** |
| **SEC-02** | OpenXML DOCX/XLSX Validated Only via Generic ZIP Magic Bytes | Medium | `FileValidationService` accepted any standard ZIP archive renamed to `.docx` or `.xlsx` without verifying OpenXML package structure. | `backend/Infrastructure/Services/FileValidationService.cs` | Integrated deep OpenXML inspection via `ZipArchive`: verified `[Content_Types].xml`, `word/document.xml` (DOCX), and `xl/workbook.xml` (XLSX), with entry count limits (500) and uncompressed size limits (50MB) against zip bombs. | `OpenXml_ValidDocxAndXlsxPackages_PassValidation`, `OpenXml_ArbitraryZipRenamedToDocxOrXlsx_IsRejected`, `OpenXml_MalformedPackage_IsRejected`, `OpenXml_ArchiveResourceExhaustion_ExcessiveEntriesRejected` | **RESOLVED & VERIFIED** |
| **SEC-03** | Target Directory Boundary Not Enforced on StoredFileName | Low-Medium | `FileService.SaveAsync` checked destination against `StorageRoot` but did not ensure it remained strictly inside the owner's target folder. | `backend/Infrastructure/Services/FileService.cs` | Added strict single filename validation (`ValidateSingleFileName`) rejecting path separators (`/`, `\`, `..`, rooted paths) and added `EnsurePathInsideTargetDir`. | `StoredFileName_PathTraversalAndSeparatorAttacks_AreRejected` | **RESOLVED & VERIFIED** |
| **ARC-01** | Redundant Generic HTTP Upload/List Routes | Low | `FilesController` exposed generic routes `POST /api/v1/files/{category}/{ownerId}` without route-level policy authorization. | `backend/API/Controllers/FilesController.cs`, `backend/API/Routing/Router.cs` | Removed redundant generic routes. All employee file operations are consolidated under `EmployeesController` with `PolicyNames.EmployeeManagement` and `PolicyNames.EmployeeView`. `FilesController` retains only secure ID-based download and metadata endpoints. | Build verification & `UnauthorizedUser_DeniedDownloadAndMetadata` | **RESOLVED & VERIFIED** |
| **ARC-02** | Multi-File Partial Disk Write Before Full Batch Validation | Medium | Files in a multi-file batch were written to disk sequentially; failure of later files required disk deletions. | `backend/Application/Features/Files/Commands/UploadFiles/UploadFilesHandler.cs`, `backend/Infrastructure/Services/FileService.cs` | Implemented an isolated temporary staging strategy (`.staging/{batchId}/`): streamed all files to staging while counting bytes, validated all staged seekable streams, and promoted files to final owner directories only after 100% of the batch passed validation. | `MultiFileUpload_ExceedingMaxFileCount_FailsValidation`, `MultiFileUpload_AllOrNothingRollback_WhenOneFileFailsValidation`, `DatabasePersistenceFailure_CleansUpAllPhysicalFiles` | **RESOLVED & VERIFIED** |
| **ARC-03** | Non-Seekable Streams Incompatible with Byte Inspection | Low-Medium | Consuming initial bytes on non-seekable streams could prevent rewinding, resulting in corrupted saved files. | `backend/Infrastructure/Services/FileValidationService.cs`, `backend/Application/Features/Files/Commands/UploadFiles/UploadFilesHandler.cs`, `backend/Infrastructure/Services/FileService.cs` | Staged incoming streams directly to disk without seeking, then validated the staged seekable file streams, guaranteeing zero byte loss. | `NonSeekableStream_UploadsSuccessfully_WithoutByteLoss` | **RESOLVED & VERIFIED** |

### Test Suite Execution Summary
- **Total Tests Passed:** 42 (0 failed, 0 skipped)
- **Employee Profile Photo Tests:** 6 comprehensive tests in `EmployeeProfilePhotoTests.cs`
- **File Storage Tests:** 24 comprehensive tests in `FileStorageTests.cs`
- **NASAQ Baseline Tests:** 12 tests in `AuthorizationTests.cs` (all green)
- **Model Snapshot:** Up to date (`ApplyMigrationsOnStartup = false`)
- **Compilation:** 0 warnings, 0 errors

---

## 16. Employee Creation with Profile Photo Workflow

### Architectural Overview
As requested, optional profile photo upload has been integrated into the existing employee creation workflow:
1. **Employee Entity:** Nullable property `ProfilePhoto` of type `Guid?` added to `Employee` storing `StoredFiles.Id`.
2. **EF Core Configuration:** Foreign key `FK_Employees_StoredFiles_ProfilePhoto` configured pointing to `StoredFiles.Id` with `DeleteBehavior.SetNull`.
3. **Migration:** EF Core migration `20261120010049_AddEmployeeProfilePhoto` generated but unapplied (`ApplyMigrationsOnStartup = false`).
4. **Single API Request & Save Action:** `EmployeesController.Create` supports both `multipart/form-data` (with or without `profilePhoto`) and `application/json`. `IFormFile` is restricted to the presentation boundary.
5. **Transactional Workflow & Cleanup:** `CreateEmployeeHandler` executes within `IUnitOfWork` transaction:
   - Stages incoming photo via `IFileService.StageFileAsync`.
   - Validates staged file stream (seekable) via `IFileValidationService.ValidateFileStreamAsync`.
   - Commits file to owner folder `{StorageRoot}/Employees/{employeeId}/{guid}.{ext}` via `IFileService.CommitStagedFileAsync`.
   - Persists `StoredFile` metadata in `StoredFiles` and assigns `StoredFile.Id` to `Employee.ProfilePhoto`.
   - Commits transaction only after all operations succeed.
   - On any failure: transaction rolls back, temporary staging files are cleaned up, and any committed physical file is immediately deleted (compensation).
6. **Frontend Integration:** Add Employee dialog updated with optional profile photo selector, preview before saving, change/remove actions, default avatar placeholder when empty, and single Save button submission.

