# NASAQ — Complete File Storage System Removal Report

**Product:** NASAQ Employee Attendance & Workforce Management System  
**Organization:** Sharm Photographer  
**Date:** 19 November 2026  
**Status:** **COMPLETED & VERIFIED (PASS)**  
**Type:** Destructive Cleanup Task (Removal Only — No Replacement)  

---

## 1. Complete Inventory of the Old File Storage System

Prior to removal, the codebase contained an embedded file storage subsystem inherited from the template:

1. **Configuration:**
   - `backend/API/appsettings.json`: `"FileStorage"` options section (`WebRootRelativeFolder`, `MaxFileSizeBytes`, `AllowedExtensions`, `GeneralSubfolder`, `DocumentsSubfolder`, `AvatarsSubfolder`).
   - `backend/Application/Configuration/FileStorageOptions.cs`: Strongly-typed configuration POCO.
2. **Abstractions & Application Types:**
   - `backend/Application/Abstractions/IFileStorageService.cs`: Interface defining `SaveAsync`, `SaveImageAsync`, `DeleteIfExistsAsync`, and `ToPublicUrlPath`.
   - `backend/Application/Files/FileStorageCategory.cs`: Enum (`General`, `Documents`, `Avatars`).
   - `backend/Application/Files/FileStorageException.cs`: Domain exception for storage errors.
   - `backend/Application/Files/FileStorageResult.cs`: Result wrapper (`Success`, `RelativePathFromWebRoot`, `ErrorMessage`).
   - `backend/Application/Files/ImageValidator.cs`: Magic bytes / format validation logic.
3. **Application Auth Commands & Handlers:**
   - `backend/Application/Features/Auth/Commands/UploadAvatar/`: `UploadAvatarCommand.cs`, `UploadAvatarHandler.cs`.
   - `backend/Application/Features/Auth/Commands/RemoveAvatar/`: `RemoveAvatarCommand.cs`, `RemoveAvatarHandler.cs`.
4. **Infrastructure Persistence & Service:**
   - `backend/Infrastructure/Files/FileStorageService.cs`: Physical disk storage implementation using `IWebHostEnvironment.WebRootPath`.
   - `backend/Infrastructure/DependencyInjection.cs`: Service registration for `IFileStorageService` and `FileStorageOptions`.
   - `backend/Infrastructure/Services/AuthService.cs`: Injection of `IFileStorageService` into constructor and implementation of avatar upload/removal.
5. **API Layer:**
   - `backend/API/Controllers/Auth/AuthController.cs`: Endpoints `POST /api/v1/auth/me/avatar` and `DELETE /api/v1/auth/me/avatar`.
   - `backend/API/Routing/Router.cs`: Route constant `Router.Auth.Avatar`.
   - `backend/API/ErrorHandling/GlobalExceptionHandler.cs`: Handling for `FileStorageException`.
   - Physical directories: `backend/API/Storage/avatars/` and `backend/API/wwwroot/uploads/` (`documents`, `general`, `logos`).
6. **Frontend Layer:**
   - `frontend/src/shared/components/upload/ImageUploader.tsx`: Multi-mode avatar and photo uploader widget.
   - `frontend/src/shared/utils/image.utils.ts`: Utility function `getImageUrl` resolving backend storage paths.
   - `frontend/src/modules/auth/services/auth.service.ts`: Client functions `uploadMyAvatar` and `removeMyAvatar`.
   - `frontend/src/lib/api/router.ts`: Route constant `Router.Auth.Avatar`.
   - `frontend/src/modules/auth/types/index.ts`: Fields `profileImagePath` and `avatarUrl` on `AuthUserResponse` and `CurrentUserResponse`.
   - `frontend/src/modules/core/profile/components/PersonalInfoTab.tsx`: Profile personal info tab integrating `ImageUploader`.
   - `frontend/src/modules/core/profile/components/ProfileHeader.tsx`: Profile header integrating `ImageUploader`.
   - `frontend/src/shared/layouts/dashboard/vertical/header/Profile.tsx`: User profile menu button resolving avatar URL.
   - `frontend/src/shared/layouts/dashboard/vertical/sidebar/SidebarProfile/Profile.tsx`: Sidebar footer profile resolving avatar URL.

---

## 2. Backend Files Deleted

The following 12 backend files and their directories were deleted:

| File Path | Layer | Purpose |
|---|---|---|
| `backend/Application/Abstractions/IFileStorageService.cs` | Application | Storage interface abstraction |
| `backend/Application/Configuration/FileStorageOptions.cs` | Application | Strongly-typed storage options POCO |
| `backend/Application/Files/FileStorageCategory.cs` | Application | Category enum |
| `backend/Application/Files/FileStorageException.cs` | Application | Storage exception type |
| `backend/Application/Files/FileStorageResult.cs` | Application | Storage result record |
| `backend/Application/Files/ImageValidator.cs` | Application | Image byte validator |
| `backend/Application/Features/Auth/Commands/UploadAvatar/UploadAvatarCommand.cs` | Application | Upload avatar CQRS command |
| `backend/Application/Features/Auth/Commands/UploadAvatar/UploadAvatarHandler.cs` | Application | Upload avatar CQRS handler |
| `backend/Application/Features/Auth/Commands/RemoveAvatar/RemoveAvatarCommand.cs` | Application | Remove avatar CQRS command |
| `backend/Application/Features/Auth/Commands/RemoveAvatar/RemoveAvatarHandler.cs` | Application | Remove avatar CQRS handler |
| `backend/Infrastructure/Files/FileStorageService.cs` | Infrastructure | Physical file storage implementation |
| `backend/API/Storage/avatars/.gitkeep` | API Storage | Placeholder in obsolete storage folder |
| `backend/API/wwwroot/uploads/documents/.gitkeep` | API WebRoot | Placeholder in obsolete upload folder |
| `backend/API/wwwroot/uploads/general/.gitkeep` | API WebRoot | Placeholder in obsolete upload folder |
| `backend/API/wwwroot/uploads/logos/.gitkeep` | API WebRoot | Placeholder in obsolete upload folder |

The directories `backend/Application/Files/`, `backend/Application/Features/Auth/Commands/UploadAvatar/`, `backend/Application/Features/Auth/Commands/RemoveAvatar/`, `backend/Infrastructure/Files/`, `backend/API/Storage/`, and `backend/API/wwwroot/uploads/` were completely removed.

---

## 3. Frontend Files Deleted

The following frontend files and directories were deleted:

| File Path | Layer | Purpose |
|---|---|---|
| `frontend/src/shared/components/upload/ImageUploader.tsx` | Shared UI | Upload widget component |
| `frontend/src/shared/utils/image.utils.ts` | Shared Utility | Storage URL resolution utility (`getImageUrl`) |

The directory `frontend/src/shared/components/upload/` was completely removed.

---

## 4. Files Modified to Remove Dependencies

### 4.1 Backend
1. **`backend/Domain/Identity/ApplicationUser.cs`**:
   - Removed property `public string? ProfileImagePath { get; set; }`.
2. **`backend/Domain/DTOs/Auth/AuthUserResponse.cs`**:
   - Removed `ProfileImagePath` and `AvatarUrl`.
3. **`backend/Domain/DTOs/Auth/CurrentUserResponse.cs`**:
   - Removed `ProfileImagePath` and `AvatarUrl`.
4. **`backend/Application/Abstractions/IAuthService.cs`**:
   - Removed method contracts `UploadAvatarAsync` and `RemoveAvatarAsync`.
5. **`backend/Application/Mapping/AuthMapper.cs`**:
   - Removed `ProfileImagePath`, `AvatarUrl`, and the private helper `ToPublicUrl`.
6. **`backend/Infrastructure/Data/Configurations/ApplicationUserConfiguration.cs`**:
   - Removed `builder.Property(u => u.ProfileImagePath).HasMaxLength(512);`.
7. **`backend/Infrastructure/DependencyInjection.cs`**:
   - Removed `using Infrastructure.Files;`.
   - Removed `services.Configure<FileStorageOptions>(...)`.
   - Removed `services.AddScoped<IFileStorageService, FileStorageService>();`.
8. **`backend/Infrastructure/Services/AuthService.cs`**:
   - Removed `IFileStorageService fileStorage` constructor parameter.
   - Removed `UploadAvatarAsync` and `RemoveAvatarAsync` method implementations.
9. **`backend/API/Controllers/Auth/AuthController.cs`**:
   - Removed `UploadAvatar` (`POST /api/v1/auth/me/avatar`) endpoint.
   - Removed `RemoveAvatar` (`DELETE /api/v1/auth/me/avatar`) endpoint.
   - Cleaned unused using directives.
10. **`backend/API/Routing/Router.cs`**:
    - Removed `public const string Avatar = Prefix + "/me/avatar";`.
11. **`backend/API/ErrorHandling/GlobalExceptionHandler.cs`**:
    - Removed `using Application.Files;`.
    - Removed `FileStorageException` switch case.
12. **`backend/API/appsettings.json`**:
    - Removed `"FileStorage"` configuration section.
    - Set `"Database:ApplyMigrationsOnStartup": false`.
13. **`backend/API/appsettings.Development.json`**:
    - Set `"Database:ApplyMigrationsOnStartup": false`.

### 4.2 Frontend
1. **`frontend/src/modules/auth/services/auth.service.ts`**:
   - Removed `uploadMyAvatar` and `removeMyAvatar` functions.
2. **`frontend/src/modules/auth/types/index.ts`**:
   - Removed `profileImagePath` and `avatarUrl` from `AuthUserResponse` and `CurrentUserResponse`.
3. **`frontend/src/lib/api/router.ts`**:
   - Removed `Avatar: \`${PREFIX}/auth/me/avatar\`` from `Router.Auth`.
4. **`frontend/src/modules/core/profile/components/PersonalInfoTab.tsx`**:
   - Removed `ImageUploader`, `uploadMyAvatar`, and `removeMyAvatar` imports.
   - Removed avatar upload/removal handlers.
   - Replaced upload box with a clean read-only initial avatar presentation (`<Avatar>{initial}</Avatar>`).
5. **`frontend/src/modules/core/profile/components/ProfileHeader.tsx`**:
   - Removed `ImageUploader`, `uploadMyAvatar`, and `removeMyAvatar` imports.
   - Replaced `<ImageUploader>` with standard MUI `<Avatar sx={{ width: 92, height: 92 }}>{initial}</Avatar>`.
6. **`frontend/src/shared/layouts/dashboard/vertical/header/Profile.tsx`**:
   - Removed `import { getImageUrl } from '@/shared/utils/image.utils'`.
   - Removed `avatarSrc` computation and `src={avatarSrc}` props on avatars.
7. **`frontend/src/shared/layouts/dashboard/vertical/sidebar/SidebarProfile/Profile.tsx`**:
   - Removed `import { getImageUrl } from '@/shared/utils/image.utils'`.
   - Removed `avatarSrc` computation and `src={avatarSrc}` props on avatar.

---

## 5. Database Schema Findings

1. **Entities & Tables:**
   - There were zero standalone file storage tables or entities (no `Files`, `Attachments`, or `StorageMetadata` tables existed).
2. **Columns in Other Entities:**
   - The only database column tied to file storage was `ProfileImagePath` (`nvarchar(512)`, nullable) on the `Users` (`AspNetUsers`) table via `ApplicationUser`.
   - `Employees`, `AppNotifications`, and `RefreshTokens` had zero file storage columns.

---

## 6. Migration Created

Because `ProfileImagePath` was removed from `ApplicationUser` and its EF Core configuration, a new migration was generated to synchronize the EF Core model:

- **Migration Name:** `20261119173723_RemoveProfileImageColumn`
- **File:** `backend/Infrastructure/Data/Migrations/20261119173723_RemoveProfileImageColumn.cs`
- **Operation:**
  ```csharp
  protected override void Up(MigrationBuilder migrationBuilder)
  {
      migrationBuilder.DropColumn(
          name: "ProfileImagePath",
          table: "Users");
  }
  ```
- **Execution Status:** **NOT APPLIED**.
  - In strict compliance with Rule 4 and Rule 5, this migration has not been applied to the database (`dotnet ef database update` was not run).
  - `ApplyMigrationsOnStartup` is configured to `false` in both `appsettings.json` and `appsettings.Development.json` to prevent automatic application.

---

## 7. Physical Storage Directories Inspected

1. **`backend/API/Storage/`**:
   - Subfolder `avatars/` contained only an empty `.gitkeep`.
   - Safely deleted entire directory.
2. **`backend/API/wwwroot/uploads/`**:
   - Subfolders `documents/`, `general/`, `logos/` contained only empty `.gitkeep` files.
   - Safely deleted `uploads/` directory.
   - Preserved `backend/API/wwwroot/`.
3. **`frontend/public/images/`**:
   - Verified static branding assets (`logos/dark-logo.svg`, `logos/light-logo.svg`, theme SVGs, etc.).
   - All static frontend assets remain 100% intact.

---

## 8. Actual Uploaded Data Preserved or Removed

- **Evidence:** File inspection of `backend/API/Storage` and `backend/API/wwwroot/uploads` confirmed that zero actual user-uploaded files, photos, or documents existed on disk (all directory entries had 0 bytes length, containing only empty `.gitkeep` files).
- **Database Records:** All seeded users and employee records in `Nasaq_Dev` have their core Identity and attendance fields intact; no user accounts or employee entities were modified or deleted.

---

## 9. Dependencies Removed

- No third-party NuGet packages or npm packages needed removal because the legacy file storage system utilized standard .NET BCL file I/O (`System.IO.FileStream`) and standard browser `FormData`.
- No modifications to `package.json` or `.csproj` dependencies were required, maintaining dependency lock integrity.

---

## 10. References Remaining

A repository-wide search confirmed:
- Zero references to `FileStorage`, `IFileStorageService`, `FileStorageOptions`, `FileStorageCategory`, `FileStorageException`, `FileStorageResult`, or `ImageValidator`.
- Zero references to `ImageUploader`, `getImageUrl`, `uploadMyAvatar`, or `removeMyAvatar`.
- Zero broken imports in frontend (`193 checked, 0 broken`).
- Zero orphaned DI registrations.

---

## 11. Backend Build and Test Results

```text
dotnet build backend/Nasaq.sln /m:1 /nr:false
Build succeeded.
    0 Warning(s)
    0 Error(s)
Time Elapsed 00:00:03.59
```

```text
dotnet test backend/Nasaq.sln
Test run for D:\Projects\NASAQ\backend\Tests\bin\Debug\net10.0\Tests.dll (.NETCoreApp,Version=v10.0)
Passed!  - Failed: 0, Passed: 12, Skipped: 0, Total: 12, Duration: 3 s - Tests.dll (net10.0)
```

---

## 12. Frontend Build Results

```text
npm --prefix frontend run validate:i18n
--- Validating next-intl translation keys for invalid literal dots ---
✅ [ar.json] Passed: All 2695 translation keys are valid.
✅ [en.json] Passed: All 2695 translation keys are valid.
All translation files are valid and free of literal dot keys!
```

```text
node frontend/scripts/verify-imports.cjs
Imports checked: 193 | Broken: 0
```

```text
npm --prefix frontend run build
✓ Compiled successfully in 4.2s
Running TypeScript ...
Generating static pages using 19 workers (13/13) in 720.2ms
Finalizing page optimization ...
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /apple-icon.png
├ ○ /employees
├ ○ /error
├ ○ /icon.png
├ ○ /login
├ ○ /maintenance
├ ○ /manifest.webmanifest
├ ○ /notifications
└ ○ /profile
○ (Static) prerendered as static content
```

---

## 13. Confirmation of Unrelated Functionality

The following system capabilities were verified to be completely unaffected:
- **Authentication & Authorization:** JWT token generation, refresh tokens, role resolution, permission claims, and protected endpoints operate normally.
- **Employee Management & Supervisor Scoping:** All Employee CRUD endpoints and supervisor assignment logic compile and pass all automated tests.
- **Report Export Engine (`ReportExportEngine.cs`):** In-memory PDF, Excel, and CSV streaming remain intact.
- **Audit Logging & Notifications:** EF Core interceptors and SignalR notification hub remain fully functional.
- **PWA & UI System:** Service worker, manifest, RTL/LTR layouts, and MUI theme tokens render without errors.
- **CoreStarter Template:** `d:\Projects\CoreStarter` remains 100% untouched.
