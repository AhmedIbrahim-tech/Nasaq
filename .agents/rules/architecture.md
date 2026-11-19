---
trigger: always_on
---

# Architecture & Layer Boundaries

This rule establishes the architectural standards and module boundaries for **CoreStarter**. All code contributions must strictly adhere to these layer definitions and dependency rules.

---

## 1. High-Level Architecture Overview

CoreStarter is structured as a decoupled Clean Architecture backend paired with a feature-sliced Next.js frontend:

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
- **Existing Elements:**
  - `Domain.Identity`: `ApplicationUser`, `ApplicationRole`, `RefreshToken`
  - `Domain.Entities`: `AppNotification`
  - `Domain.Authorization`: `Permissions`, `RoleNames`, `PolicyNames`
  - `Domain.Common`: `GenericBaseResponse<T>`, `IAuditableEntity`, `ICreationAuditable`, `IModificationAuditable`
  - `Domain.Repositories`: `IGenericRepository<T>`, `IUnitOfWork`

### 2.2 Application Layer (`backend/Application/`)
- **Responsibility:** Use cases, business rules orchestration, CQRS Commands/Queries, MediatR pipeline behaviors, DTOs, and interface contracts.
- **Dependencies:** References **`Domain` only**. Does NOT reference `Infrastructure` or `API`.
- **Existing Elements:**
  - `Application.Abstractions`: `IApplicationDbContext`, `IAuthService`, `ITokenService`, `ICurrentUser`, `ICurrentLanguage`
  - `Application.Common.Behaviors`: `ValidationBehavior<TRequest, TResponse>`
  - `Application.Features.Auth`: Commands (`LoginCommand`, `RefreshTokenCommand`, `UpdateProfileCommand`), Queries (`GetCurrentUserQuery`), and their respective Handlers.
  - `Application.Features.Notifications`: Commands and Queries for notification management.
  - `Application.Configuration`: Strongly-typed configuration POCOs (`JwtSettings`, `DefaultAdminOptions`).

### 2.3 Infrastructure Layer (`backend/Infrastructure/`)
- **Responsibility:** External concerns, database persistence (EF Core), identity service implementation, email senders, file storage, and background processing.
- **Dependencies:** References **`Application` and `Domain`**.
- **Existing Elements:**
  - `Infrastructure.Data`: `ApplicationDbContext`, entity configurations (`IEntityTypeConfiguration<T>`), `DbInitializer`, and EF Core Migrations.
  - `Infrastructure.Authentication`: `JwtTokenService`, `CustomUserIdProvider`.
  - `Infrastructure.Services`: `AuthService`, `CurrentUser`, `CurrentLanguage`, `RefreshTokenService`.
  - `Infrastructure.Repositories`: `GenericRepository<T>`, `UnitOfWork`.

### 2.4 API Layer (`backend/API/`)
- **Responsibility:** Presentation entry point, HTTP routing, controller endpoints, middleware pipelines, Swagger documentation, and dependency injection composition root.
- **Dependencies:** References **`Application` and `Infrastructure`**.
- **Existing Elements:**
  - `API.Controllers.Base`: `ApiControllerBase` (provides `_mediator` and `ActionResult<T>()`).
  - `API.Controllers`: `AuthController`, `NotificationsController`.
  - `API.Routing`: Centralized type-safe route strings in `Router.cs`.
  - `API.ErrorHandling`: `GlobalExceptionHandler` returning RFC 7807 responses.
  - `API.Program`: Minimal hosting setup and middleware configuration.

---

## 3. Frontend Architecture (Next.js 16)

### 3.1 App Router (`frontend/src/app/`)
- Contains routing and layout definitions using Next.js 16 route groups:
  - `(auth)/`: Authentication pages (`login/page.tsx`).
  - `(Dashboard)/`: Protected dashboard views (`notifications/page.tsx`, `profile/page.tsx`).
  - `(system)/`: Error handling (`error/page.tsx`, `maintenance/page.tsx`).
  - `layout.tsx`, `page.tsx`, `not-found.tsx`.
- **Rule:** Page components in `src/app/` must remain lightweight coordinators. They import and render views from `src/modules/` or `src/shared/`.

### 3.2 Feature Modules (`frontend/src/modules/`)
- Organized as vertical slices by business capability:
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

When adding a new module (e.g., `Documents`):

1. **Domain First:**
   - Define entity in `backend/Domain/Entities/Document.cs` implementing audit interfaces.
   - Define repository interface in `backend/Domain/Repositories/IDocumentRepository.cs` if specialized queries are required.
2. **Infrastructure Persistence:**
   - Add `DbSet<Document> Documents` to `IApplicationDbContext` and `ApplicationDbContext`.
   - Create EF Core configuration in `backend/Infrastructure/Data/Configurations/DocumentConfiguration.cs`.
3. **Application Use Cases:**
   - Create vertical slice `backend/Application/Features/Documents/`.
   - Place commands and queries in subfolders: `Commands/CreateDocument/`, `Queries/GetDocuments/`.
   - Implement handlers implementing `IRequestHandler<TRequest, GenericBaseResponse<TResponse>>`.
   - Add FluentValidation validator in `Validators/CreateDocumentValidator.cs`.
4. **API Controller:**
   - Define routes in `backend/API/Routing/Router.cs`.
   - Create `backend/API/Controllers/DocumentsController.cs` inheriting from `ApiControllerBase`.
   - Protect endpoints with `[Authorize]` and `[HasPermission(...)]`.
5. **Frontend Feature Slice:**
   - Create `frontend/src/modules/documents/` containing `api/`, `components/`, `types/`, and `views/`.
   - Add routes in `frontend/src/lib/api/router.ts`.
   - Add page in `frontend/src/app/(Dashboard)/documents/page.tsx`.
   - Add menu entry in `src/shared/layouts/dashboard/vertical/sidebar/MenuItems.ts`.
   - Add translation keys to both `ar.json` and `en.json`.
