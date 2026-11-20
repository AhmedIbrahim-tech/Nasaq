---
trigger: always_on
---

# Architecture & Layer Boundaries

This rule establishes the architectural standards and module boundaries for **NASAQ** (derived from CoreStarter). All code contributions must strictly adhere to these layer definitions and dependency rules.

---

## 1. High-Level Architecture Overview

NASAQ is structured as a decoupled Clean Architecture backend paired with a feature-sliced Next.js frontend:

```text
Backend:   [API Presentation] ──► [Application] ◄── [Infrastructure]
                                         │
                                         ▼
                                     [Domain]

Frontend:  [App Router (src/app)] ──► [Feature Modules (src/modules)]
                                         │
                                         ▼
                                   [Shared & Core]
```

---

## 2. Backend Clean Architecture Layers

### 2.1 Domain Layer (`backend/Domain/`)
- **Responsibility:** Enterprise business entities, domain interfaces, enums, custom exceptions, and core value objects.
- **Dependencies:** **Zero external dependencies**. Never reference `Application`, `Infrastructure`, `API`, or third-party ORMs (e.g., EF Core).
- **Core Elements:**
  - `Domain.Identity`: `ApplicationUser`, `ApplicationRole`, `RefreshToken`
  - `Domain.Entities`: `Employee`, `StoredFile`, `AppNotification`
  - `Domain.Enums`: `FileCategory`, `NotificationCategory`
  - `Domain.Authorization`: `Permissions`, `RoleNames`, `PolicyNames`
  - `Domain.Common`: `GenericBaseResponse<T>`, `IAuditableEntity`, `ICreationAuditable`, `IModificationAuditable`
  - `Domain.Repositories`: `IGenericRepository<T>`, `IUnitOfWork`

### 2.2 Application Layer (`backend/Application/`)
- **Responsibility:** Use cases, business rules orchestration, CQRS Commands/Queries, MediatR pipeline behaviors, DTOs, and interface contracts.
- **Dependencies:** References **`Domain` only**. Does NOT reference `Infrastructure` or `API`.
- **Architectural Policy on `IFormFile`:** NASAQ explicitly permits `IFormFile` within Application Commands, Queries, and Handlers to avoid unnecessary stream wrapper abstractions and to maintain clean, high-performance file handling.
- **Core Elements:**
  - `Application.Abstractions`: `IApplicationDbContext`, `IUnitOfWork`, `IAuthService`, `ITokenService`, `ICurrentUser`, `ICurrentLanguage`, `IFileService`, `IFileValidationService`, `IFileAccessAuthorizer`, `INotificationService`, `INotificationRealtimePublisher`
  - `Application.Common.Behaviors`: `ValidationBehavior<TRequest, TResponse>`
  - `Application.Features.Employees`: Commands (`CreateEmployeeCommand`, `UpdateEmployeeCommand`, `ToggleEmployeeStatusCommand`), Queries (`GetEmployeesQuery`, `GetEmployeeByIdQuery`, `GetCurrentEmployeeProfileQuery`, `GetSupervisorsQuery`).
  - `Application.Features.Files`: Commands (`UploadFilesCommand`), Queries (`GetFilesByOwnerQuery`, `GetFileMetadataQuery`, `DownloadFileQuery`).
  - `Application.Features.Auth`: Commands (`LoginCommand`, `RefreshTokenCommand`, `LogoutCommand`, `FirstLoginChangePasswordCommand`, `UpdateProfileCommand`, `ChangePasswordCommand`), Queries (`GetCurrentUserQuery`).
  - `Application.Features.Notifications`: Commands and Queries for notification management.
  - `Application.Configuration`: Strongly-typed configuration POCOs (`JwtSettings`, `DefaultAdminOptions`, `StorageOptions`).

### 2.3 Infrastructure Layer (`backend/Infrastructure/`)
- **Responsibility:** External concerns, database persistence (EF Core), identity service implementation, file storage, email senders, and background processing.
- **Dependencies:** References **`Application` and `Domain`**.
- **Core Elements:**
  - `Infrastructure.Data`: `ApplicationDbContext`, entity configurations (`EmployeeConfiguration`, `StoredFileConfiguration`, `AppNotificationConfiguration`), `DbInitializer`, and EF Core Migrations.
  - `Infrastructure.Authentication`: `JwtTokenService`, `CustomUserIdProvider`.
  - `Infrastructure.Services`: `AuthService`, `CurrentUser`, `CurrentLanguage`, `RefreshTokenService`, `FileService`, `FileValidationService`, `FileAccessAuthorizer`, `NotificationService`, `TemporaryPasswordService`.
  - `Infrastructure.Repositories`: `GenericRepository<T>`, `UnitOfWork`.

### 2.4 API Layer (`backend/API/`)
- **Responsibility:** Presentation entry point, HTTP routing, controller endpoints, middleware pipelines, Swagger documentation, and dependency injection composition root.
- **Dependencies:** References **`Application` and `Infrastructure`**.
- **Core Elements:**
  - `API.Controllers.Base`: `ApiControllerBase` (provides `_mediator` and `ActionResult<T>()`).
  - `API.Controllers`: `EmployeesController`, `FilesController`, `AuthController`, `NotificationsController`.
  - `API.Routing`: Centralized type-safe route strings in `Router.cs`.
  - `API.ErrorHandling`: `GlobalExceptionHandler` returning RFC 7807 responses.
  - `API.Program`: Minimal hosting setup and middleware configuration.

---

## 3. Frontend Architecture (Next.js 16)

### 3.1 App Router (`frontend/src/app/`)
- Contains routing and layout definitions using Next.js 16 route groups:
  - `(auth)/`: Authentication pages (`login/page.tsx`).
  - `(Dashboard)/`: Protected dashboard views (`employees/page.tsx`, `notifications/page.tsx`, `profile/page.tsx`).
  - `(system)/`: Error handling (`error/page.tsx`, `maintenance/page.tsx`).
  - `layout.tsx`, `page.tsx`, `not-found.tsx`.
- **Rule:** Page components in `src/app/` must remain lightweight coordinators. They import and render views from `src/modules/` or `src/shared/`.

### 3.2 Feature Modules (`frontend/src/modules/`)
- Organized as vertical slices by business capability:
  - `modules/employees/`: Components, dialogs, services, Redux slice, types, and views.
  - `modules/auth/`: Components, context, hooks, services, Redux slice (`auth.slice.ts`), thunks, types, validation, and views.
  - `modules/core/notifications/`: Notification center components, hooks, services, Redux slice, types, and views.
  - `modules/core/profile/`: Profile header, tab panels, and personal info management.
- **Rule:** Feature modules own their state, API services, and presentation logic. Cross-feature imports should be minimized; shared utilities belong in `src/shared/`.

### 3.3 Shared Presentation & Infrastructure (`frontend/src/shared/`, `src/theme/`, `src/lib/`, `src/i18n/`)
- `src/shared/components/`: Reusable, generic UI widgets (cards, tables, forms, dialogs).
- `src/shared/layouts/`: Dashboard layout (vertical/horizontal navigation, sidebar, header).
- `src/theme/`: Material UI v6 theme definitions, palettes, typography, and RTL integration.
- `src/lib/api/`: Axios instance (`api.ts`), response interceptors, and route constants (`router.ts`).
- `src/i18n/`: Internationalization configuration and translation dictionaries (`ar.json`, `en.json`).

---

## 4. Rules for Introducing New Modules

When adding a new module:

1. **Domain First:**
   - Define entity in `backend/Domain/Entities/` implementing appropriate audit interfaces.
   - Define repository interface in `backend/Domain/Repositories/` if specialized domain queries are required.
2. **Infrastructure Persistence:**
   - Add `DbSet<TEntity>` to `IApplicationDbContext` and `ApplicationDbContext`.
   - Create EF Core configuration in `backend/Infrastructure/Data/Configurations/<Entity>Configuration.cs`.
3. **Application Use Cases:**
   - Create vertical slice `backend/Application/Features/<ModuleName>/`.
   - Place commands and queries in subfolders: `Commands/<ActionName>/`, `Queries/<QueryName>/`.
   - Implement handlers implementing `IRequestHandler<TRequest, GenericBaseResponse<TResponse>>`.
   - Add FluentValidation validator in `<ActionName>Validator.cs`.
4. **API Controller:**
   - Define routes in `backend/API/Routing/Router.cs`.
   - Create `backend/API/Controllers/<ModuleName>Controller.cs` inheriting from `ApiControllerBase`.
   - Bind endpoints directly to CQRS Commands/Queries where appropriate.
   - Protect endpoints with `[Authorize]` and policy/permission attributes.
5. **Frontend Feature Slice:**
   - Create `frontend/src/modules/<module-name>/` containing `components/`, `services/`, `slices/`, `types/`, and `views/`.
   - Add routes in `frontend/src/lib/api/router.ts`.
   - Add page in `frontend/src/app/(Dashboard)/<module-name>/page.tsx`.
   - Add menu entry in `src/shared/layouts/dashboard/vertical/sidebar/MenuItems.ts`.
   - Add translation keys to both `ar.json` and `en.json`.

---

## 5. Cross-Cutting Concerns: Centralized File Storage & Media

### 5.1 Unified File Storage Service
- All file saving, physical persistence, and metadata recording are centralized through `IFileService` and `FileService`.
- No module may invent a separate or duplicate storage mechanism.
- Handlers invoke `IFileService.SaveAsync(IFormFile, FileCategory, Guid ownerId)` directly when file handling is part of a domain workflow.

### 5.2 Centralized Files API
- General-purpose file management endpoints belong in `FilesController`:
  ```text
  POST /api/v1/files/upload
  GET  /api/v1/files
  GET  /api/v1/files/{id}
  GET  /api/v1/files/{id}/download
  ```
- File access authorization is enforced through `IFileAccessAuthorizer`, verifying ownership and user role permissions based on the file's category.
- Currently, `FileCategory.Employees` is supported. Other categories must be rejected until their ownership and access policies are defined.

### 5.3 Employee Profile Photo Design
- The `Employee` entity stores only a reference to the file metadata:
  ```csharp
  public Guid? ProfilePhoto { get; set; }
  ```
- **Rules for Profile Photos:**
  1. `Employee.ProfilePhoto` stores the `Guid` referencing `StoredFiles.Id`. Never store image binary content in the Employee table.
  2. Photo upload is optional in both Employee Create and Update workflows.
  3. When updating an employee without providing a new photo, preserve the existing `ProfilePhoto` reference.
  4. Explicit photo removal is supported by setting the reference to `null`.
  5. If replacing an existing photo, do NOT delete the old physical image until the replacement database transaction has committed successfully.
  6. Use a temporary placeholder avatar until the project owner provides the final default system image.
