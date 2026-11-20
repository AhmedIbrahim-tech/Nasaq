# NASAQ — AI Engineering Rules Catalog

This catalog documents the active engineering rules and quality standards governing all AI agents and developers working on the **NASAQ** Employee Attendance & Workforce Management System.

---

## 1. Rule Index

| Rule File | Scope | Summary |
|---|---|---|
| [ai-safety.md](file:///.agents/rules/ai-safety.md) | Universal | 12 Golden Safety Rules: Analyze First, Strict Architecture, Zero Unnecessary Refactoring, Template Purity. |
| [architecture.md](file:///.agents/rules/architecture.md) | Universal | Clean Architecture layers, Next.js feature slicing, and **Centralized File Storage & Media Architecture**. |
| [backend-dotnet.md](file:///.agents/rules/backend-dotnet.md) | Backend (.NET 10) | C# 13 standards, **CQRS Direct Binding Policy**, **Code Comments & Global Usings Policy**, **Centralized File Storage**, and **Unit of Work & Post-Commit Rules**. |
| [database-efcore.md](file:///.agents/rules/database-efcore.md) | Database | EF Core migrations, configuration conventions, index strategies, shared Identity/UnitOfWork transactions, and safe rollback. |
| [security-auth.md](file:///.agents/rules/security-auth.md) | Security | 4-tier RBAC (`SuperAdmin`, `Admin`, `Supervisor`, `Employee`), JWT authentication, token rotation, supervisor scoping. |
| [frontend-nextjs.md](file:///.agents/rules/frontend-nextjs.md) | Frontend (Next.js 16) | Next.js App Router, feature modules, Redux Toolkit, and PWA integration. |
| [design-system-i18n.md](file:///.agents/rules/design-system-i18n.md) | Frontend | Material UI theme tokens, bi-directional Arabic RTL / English LTR, next-intl keys. |
| [testing-quality.md](file:///.agents/rules/testing-quality.md) | Quality | Verification gates: 0 compiler warnings, import integrity, translation validation, testing freeze rules, and post-freeze verification checklist. |

---

## 2. Core Architectural Policies (Rule Highlights)

### 2.1 CQRS Direct Binding Policy (`backend-dotnet.md` §2.3)
- Prefer direct model binding to MediatR Commands and Queries (`[FromBody]`, `[FromQuery]`, `[FromForm]`, `[FromRoute]`).
- Prohibit redundant intermediate Request DTOs that merely duplicate Command/Query properties.
- Retain Request Models only by exception (security boundaries, server-managed properties, or distinct public API contracts).
- Route IDs and authenticated `CurrentUserId` claims must remain authoritative.

### 2.2 Centralized File Storage Architecture (`backend-dotnet.md` §10, `architecture.md` §5)
- All file operations centralized through `IFileService` and `FileService` (storage & metadata), `IFileValidationService` (extension, size, magic-byte signatures), and `IFileAccessAuthorizer` (record-level authorization).
- General endpoints live in `FilesController` (`/api/v1/files/upload`, `/api/v1/files`, `/api/v1/files/{id}`, `/api/v1/files/{id}/download`).
- Handlers call `IFileService.SaveAsync` directly. `IFormFile` is explicitly permitted within Application Commands and Handlers.
- `Employee.ProfilePhoto` stores `Guid?` referencing `StoredFiles.Id` (never binary content in business tables).
- Physical files remain on disk outside database and web root with GUID-based names.

### 2.3 Unit of Work & Transaction Lifecycle (`backend-dotnet.md` §11, `database-efcore.md` §5)
- Shared scoped `ApplicationDbContext` between Identity and application entities.
- Start transactions before Identity/business mutations; check every `IdentityResult`.
- Database rollback via `UnitOfWork.RollbackAsync()` is authoritative; manual Identity deletion compensation after rollback is prohibited.
- `RegisterPostCommitAction` strictly requires an active transaction (`HasActiveTransaction == true`); post-commit callbacks execute sequentially after confirmed commit.
- `NotificationService`: Uses post-commit actions inside transactions; persists and awaits directly with error logging outside transactions. Never opens unnecessary database transactions solely to dispatch SignalR events.

### 2.4 Code Comments & Global Usings Policy (`backend-dotnet.md` §9)
- **Self-documenting code is the default:** Code must express intent through clear naming and clean structure.
- **Prohibited:** Routine XML documentation (`/// <summary>`), redundant explanations of what code does, and decorative `#region` blocks.
- **Allowed by Exception:** Explaining **WHY** for non-obvious business logic, security guards (e.g. anti-escalation), or technical workarounds (e.g. `DeleteBehavior.Restrict`).
- **Global Usings:** Each project manages an authoritative `GlobalUsings.cs`. Redundant file-level `using` directives for globally imported namespaces are strictly eliminated.
