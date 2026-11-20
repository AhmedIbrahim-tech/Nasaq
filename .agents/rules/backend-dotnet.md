---
trigger: glob
globs: "**/backend/**/*.cs, **/backend/**/*.csproj, **/backend/**/*.json"
---

# Backend .NET 10 Engineering Standards

This rule defines the coding conventions, design patterns, and engineering practices for the .NET 10 backend solution (`Nasaq.sln`).

---

## 1. C# 13 & Language Features

- **File-Scoped Namespaces:** Always use file-scoped namespaces (e.g., `namespace Application.Features.Auth;`).
- **Primary Constructors:** Use primary constructors on classes, handlers, services, and records:
  ```csharp
  public sealed class LoginHandler(IAuthService authService)
      : IRequestHandler<LoginCommand, GenericBaseResponse<AuthResponse>>
  ```
- **Records for Immutability:** Use `record` or `sealed record` for CQRS Commands, Queries, and DTOs.
- **Pattern Matching:** Prefer pattern matching expressions and switch expressions over nested `if-else` blocks.
- **Nullable Reference Types:** Nullable reference types are strictly enabled (`<Nullable>enable</Nullable>`). Avoid null-forgiving operators (`!`) unless strictly warranted.

---

## 2. CQRS & MediatR Pattern

### 2.1 Commands & Queries
- Commands and Queries must be defined as `sealed record` and implement `IRequest<GenericBaseResponse<T>>`:
  ```csharp
  namespace Application.Features.Notifications.Commands.MarkNotificationRead;

  public sealed record MarkNotificationReadCommand(string? UserId, Guid NotificationId)
      : IRequest<GenericBaseResponse<bool>>;
  ```
- Place each Command and Query in its own dedicated directory:
  `Features/<ModuleName>/Commands/<ActionName>/<ActionName>Command.cs`
  `Features/<ModuleName>/Queries/<QueryName>/<QueryName>Query.cs`

### 2.2 Handlers
- Handlers must be `sealed class` implementing `IRequestHandler<TRequest, TResponse>`.
- Keep handlers focused: orchestrate domain operations or delegate to domain/infrastructure services.
- Never write direct SQL or database mutations inside API controllers; all execution flows through MediatR handlers.

### 2.3 Commands & Queries First: Direct Model Binding Policy
- **Prefer Direct Binding:** Bind API endpoints directly to MediatR Commands and Queries using standard ASP.NET Core binding attributes (`[FromBody]`, `[FromQuery]`, `[FromForm]`, `[FromRoute]`).
- **Eliminate Redundant Request DTOs:** Do NOT create separate Request classes or DTOs merely to copy their properties into a Command or Query. Eliminate redundant request-to-command mappings.
- **No Automatic Request DTO Generation:** Do not automatically create a Request DTO for every Command or Query.
- **Permitted Request Models (By Justified Exception Only):** Separate Request Models are permitted only when justified by:
  1. *Security boundaries:* Keeping client-supplied bodies separate from server-managed claims (e.g., `UpdateProfileRequest` separating client fields from the authenticated `CurrentUserId`).
  2. *Server-managed identifiers or sensitive properties:* Preventing client tampering of IDs, audit properties, or ownership flags.
  3. *Different API and application contracts:* Where binding the Command directly would alter or break the public REST JSON contract (e.g., Auth service commands wrapping domain DTOs).
  4. *Backward compatibility:* Maintaining existing external client contracts without breaking changes.
  5. *Model binding limitations:* Where framework binding behavior prevents direct instantiation of complex record hierarchies.
- **No Weakened Contracts:** Do not alter Command constructors or add artificial default values solely to satisfy model binding if doing so weakens validation, introduces ambiguous API behavior, or bypasses business constraints.
- **Response DTOs Preserved:** Always use typed response DTOs (e.g., `EmployeeDto`, `StoredFileDto`) rather than exposing EF Core entities directly to clients.

---

## 3. Validation Pipeline

- Every Command that accepts user input should have a corresponding FluentValidation validator inheriting from `AbstractValidator<T>`:
  ```csharp
  public sealed class CreateEmployeeValidator : AbstractValidator<CreateEmployeeCommand>
  {
      public CreateEmployeeValidator()
      {
          RuleFor(x => x.Email).NotEmpty().EmailAddress();
          RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
      }
  }
  ```
- Validation is executed automatically before the handler via `ValidationBehavior<TRequest, TResponse>`.
- Validation errors are mapped automatically to `GenericBaseResponse<T>.ValidationFail(...)`.

---

## 4. API Controllers & Routing

### 4.1 Base Controller & Direct CQRS Binding
- All controllers must inherit from `ApiControllerBase` (`backend/API/Controllers/Base/ApiControllerBase.cs`).
- Use `[ApiController]` attribute on all controller classes.
- Controllers must remain thin coordinators delegating directly to `_mediator.Send(...)`:
  ```csharp
  [HttpPost(Router.Employees.Create)]
  [Authorize(Policy = PolicyNames.EmployeeManagement)]
  [Consumes("multipart/form-data")]
  public async Task<IActionResult> Create(
      [FromForm] CreateEmployeeCommand command,
      CancellationToken cancellationToken = default) =>
      ActionResult(await _mediator.Send(command, cancellationToken));

  [HttpGet(Router.Employees.List)]
  [Authorize(Policy = PolicyNames.RequireSupervisor)]
  public async Task<IActionResult> GetEmployees(
      [FromQuery] GetEmployeesQuery query,
      CancellationToken cancellationToken = default) =>
      ActionResult(await _mediator.Send(query, cancellationToken));
  ```
- Use `ActionResult(response)` helper to automatically map HTTP status codes from `response.StatusCode`.

### 4.2 Route ID & Identity Authority
- **Route IDs are Authoritative:** For endpoints with route parameters (e.g., `PUT /employees/{id}`), the route value must always override any client-supplied body or form value:
  ```csharp
  [HttpPut(Router.Employees.Update)]
  [Authorize(Policy = PolicyNames.EmployeeManagement)]
  [Consumes("multipart/form-data")]
  public async Task<IActionResult> Update(
      [FromRoute] Guid id,
      [FromForm] UpdateEmployeeCommand command,
      CancellationToken cancellationToken = default) =>
      ActionResult(await _mediator.Send(command with { Id = id }, cancellationToken));
  ```
- **Server-Managed Fields Must Not Be Client-Controllable:** Never expose or allow clients to control server-managed properties such as:
  - Current authenticated user ID (always resolve via `CurrentUserId` claim).
  - Audit timestamps or creator/modifier IDs.
  - Internal authorization flags or role assignments.
  - Server-generated primary keys.
- If direct binding would expose server-managed fields as client-controllable parameters in Swagger/OpenAPI, retain explicit controller parameters or separate request models.

### 4.3 Centralized Routing
- Do NOT hardcode raw string routes inside controller action attributes.
- Always reference the centralized route registry in `backend/API/Routing/Router.cs`:
  ```csharp
  public static class Router
  {
      public const string Prefix = "api/v1/";
      // ...
  }
  ```

---

## 5. API Response Conventions

Every endpoint must return a typed `GenericBaseResponse<T>` (`backend/Domain/Common/GenericBaseResponse.cs`):
```json
{
  "statusCode": 200,
  "succeeded": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "errors": null,
  "validationErrors": null,
  "meta": null
}
```
Use the `ResponseHandler` service (`backend/Application/Common/ResponseHandler.cs`) or static methods on `GenericBaseResponse<T>` to construct responses:
- `Success<T>(data, message)` -> 200 OK
- `Created<T>(data, message)` -> 201 Created
- `NotFound<T>(message)` -> 404 Not Found
- `Fail<T>(message, statusCode)` -> Custom failure

---

## 6. Dependency Injection

- Each layer manages its own service registrations via an `IServiceCollection` extension method:
  - `Application.DependencyInjection.AddApplication(this IServiceCollection services)`
  - `Infrastructure.DependencyInjection.AddInfrastructure(this IServiceCollection services, IConfiguration configuration)`
  - `API.Extensions.ServiceCollectionExtensions.AddApiServices(this IServiceCollection services, IConfiguration configuration)`
- Always register services with appropriate lifetimes:
  - `Scoped`: DbContext, UnitOfWork, Repositories, CurrentUser, AuthService, FileService, FileValidationService, FileAccessAuthorizer.
  - `Transient`: MediatR handlers, Validators, transient helpers.
  - `Singleton`: Static helpers, stateless utilities, options configurators.

---

## 7. Asynchronous Programming & Cancellation

- Every I/O bound operation (database queries, network calls, file writes) must be asynchronous (`async Task<T>`).
- Always accept a `CancellationToken` parameter in controller actions, handlers, and repository methods.
- Pass the token through to all EF Core async methods (e.g., `ToListAsync(cancellationToken)`).

---

## 8. Error Handling & Logging

- Exceptions are caught and transformed into RFC 7807 Problem Details by `GlobalExceptionHandler` (`backend/API/ErrorHandling/GlobalExceptionHandler.cs`).
- Never leak sensitive database exception messages or stack traces to API clients in production.
- Use `ILogger<T>` for structured logging with semantic parameters:
  ```csharp
  logger.LogInformation("User {UserId} successfully updated profile at {Timestamp}", userId, DateTime.UtcNow);
  ```
- Mask sensitive fields (passwords, tokens, credit cards) using `SensitiveDataMasker` before logging payloads.

---

## 9. Code Comments & Global Usings Policy

### 9.1 Code Comments Policy (Strict)
- **Self-Documenting Code is the Default:** Write clear, concise, self-explanatory C# code with expressive naming for classes, records, methods, and variables.
- **Prohibited Comments:**
  - Do NOT add XML documentation comments (`/// <summary>`) for internal application classes, controllers, endpoints, handlers, records, or DTOs unless explicitly required by an external contract.
  - Do NOT write obvious or redundant comments that repeat what the code already expresses (e.g. `// Retrieves employees`, `// Update user details`, `// Check email`).
  - Do NOT use decorative section headers or `#region` blocks for straightforward members.
  - Do NOT explain basic variable assignments or trivial framework patterns.
- **Permitted Comments (By Exception Only):**
  - Allowed ONLY when genuinely necessary to explain non-obvious business rules, multi-stage dependent algorithms, critical execution order dependencies, non-obvious technical workarounds (e.g., `DeleteBehavior.Restrict` preventing SQL Server cascade cycles), or security-sensitive constraints (e.g., privilege escalation guards).
  - Keep permitted comments short, focused, and explain **WHY** rather than **WHAT**.

### 9.2 Global Usings Policy (Strict)
- **Centralized Project Scope:** Each .NET project (`Domain`, `Application`, `Infrastructure`, `API`, `Tests`) maintains its own authoritative `GlobalUsings.cs` file.
- **Compile Boundaries:** Respect Clean Architecture dependency boundaries. Never import namespaces that introduce circular dependencies, unauthorized layer leaks, or type ambiguities.
- **No Redundant Local Directives:** When a namespace is declared in a project's `GlobalUsings.cs`, do NOT include redundant file-level `using` statements in individual source files.
- **No Unused Directives:** Remove unused using directives from all files.
- **No Duplication:** Never duplicate global using declarations within the same `GlobalUsings.cs` file.
- **File-Level Usings by Exception:** Use file-level using statements only when a namespace is genuinely specific to that single file or when a global import would create naming collisions or unwanted global scope.

---

## 10. Centralized File Storage Architecture

### 10.1 Unified File Services
The solution provides a single centralized file storage and validation mechanism:
- **`IFileService` & `FileService`:** Manage physical file storage, temporary staging, and `StoredFile` metadata creation.
- **`IFileValidationService` & `FileValidationService`:** Validate file extensions, size limits, canonical MIME types, and magic-byte file signatures.
- **`IFileAccessAuthorizer` & `FileAccessAuthorizer`:** Authorize access and download rights based on domain entity ownership and user role permissions.
- **`FilesController`:** Exposes centralized general-purpose file endpoints.

### 10.2 IFormFile in Application Layer (Architectural Decision)
- **Approved Contract:** NASAQ explicitly allows `IFormFile` directly within Application Commands, Queries, and Handlers:
  ```csharp
  Task<StoredFile> SaveAsync(
      IFormFile file,
      FileCategory category,
      Guid ownerId,
      CancellationToken cancellationToken = default);
  ```
- **Prohibited Abstractions:** Do NOT introduce `FileUploadModel`, unnecessary `Stream` wrappers, or duplicate file storage services.
- **Physical vs Database Storage:** Physical files are stored on disk outside the database and outside `wwwroot`, using unique GUID-based filenames. The original user filename is safely recorded in `StoredFiles.OriginalFileName`.

### 10.3 Storage Boundaries & Responsibilities
- **`FileService` Responsibilities:**
  1. Secure staging and temporary path handling.
  2. Extension, size, canonical MIME, and magic-byte signature validation via `IFileValidationService`.
  3. Safe physical persistence under configured directory structure (`{StorageRoot}/{Category}/{OwnerId}/{FileId}{Extension}`).
  4. Creating the `StoredFile` metadata entity and adding it to the DbContext change tracker (`dbContext.StoredFiles.Add(storedFile)`).
  5. Staging cleanup.
- **Transaction Restrictions on `FileService`:**
  - `FileService` must NOT independently start, commit, or roll back database transactions.
  - `FileService` must NOT call `SaveChangesAsync`.
  - The calling business Handler manages the database persistence and transaction boundaries.
  - Handlers must never duplicate `StoredFile` entity construction.

### 10.4 Centralized Files API
- General-purpose file endpoints belong exclusively in `FilesController`:
  ```text
  POST /api/v1/files/upload
  GET  /api/v1/files
  GET  /api/v1/files/{id}
  GET  /api/v1/files/{id}/download
  ```
- Do not duplicate general file upload, listing, or download endpoints across business Controllers.
- Module-specific workflows (such as creating an employee with an optional profile photo) consume `IFileService` directly within their own business Handlers.
- Unsupported `FileCategory` values must be rejected until their ownership and access policies are implemented (currently, `FileCategory.Employees` is supported).

---

## 11. Unit of Work, Transaction Lifecycle & Post-Commit Rules

### 11.1 Shared DbContext & Atomic Mutations
- **Shared Scoped Context:** ASP.NET Core Identity, business entities (e.g. `Employee`), and `UnitOfWork` share the same scoped `ApplicationDbContext`.
- **Atomic Operations:** Begin the database transaction via `IUnitOfWork.BeginTransactionAsync` before initiating Identity or business mutations that must succeed or fail together.
- **Identity Result Checking:** Check every `IdentityResult`. If any Identity operation fails, throw an exception or return a failure response so the active transaction is rolled back cleanly.

### 11.2 Rollback Safety & Elimination of Manual Compensation
- **Database Rollback is Authoritative:** Rollback via `IUnitOfWork.RollbackAsync()` (or within `ExecuteInTransactionAsync`) cleans up all SQL mutations in the transaction across both Identity and application tables.
- **No Manual Deletion Compensation:** Do NOT invoke manual Identity compensation operations (such as manually calling `userManager.DeleteAsync` or removing roles) after a successful database rollback. Doing so is redundant, unsafe, and risks throwing entity-tracking or concurrency conflicts.
- **Never Call SaveChangesAsync on Rollback:** Never call `SaveChangesAsync` to attempt manual reversal after a database rollback.
- **Change Tracker Cleared:** `RollbackAsync` automatically clears the EF Core change tracker (`context.ChangeTracker.Clear()`).

### 11.3 Physical Files & Database Transaction Independence
- SQL transactions do NOT roll back physical disk writes.
- File-writing business operations must track newly written physical files and clean them up only upon confirmed database rollback.
- If a commit fails with uncertain outcome, preserve physical files and log an error to prevent premature data loss.
- Never roll back a transaction that has already committed successfully.

### 11.4 Post-Commit Actions & Notification Dispatch
- **Strict Active Transaction Requirement:** `IUnitOfWork.RegisterPostCommitAction(Func<Task> action)` strictly requires an active transaction (`HasActiveTransaction == true`). It throws `InvalidOperationException` if invoked outside an active transaction.
- **Sequential Execution:** Registered callbacks are executed sequentially and awaited only after a confirmed successful database commit.
- **No Fire-and-Forget:** Do NOT use `Task.Run` for post-commit callbacks.
- **Failure Isolation:** An exception in a post-commit callback is logged (`_logger.LogError`) and swallowed to prevent failing an already committed database transaction.
- **Discarded on Rollback:** All post-commit callbacks are immediately discarded on transaction rollback.
- **NotificationService Dual-Path Execution:**
  - *Inside an active transaction:* Save changes to the context, then call `_unitOfWork.RegisterPostCommitAction(...)` to publish real-time SignalR events only upon successful commit.
  - *Outside an active transaction:* Persist changes via `_unitOfWork.SaveChangesAsync(...)` directly, then explicitly await `_publisher.Publish...Async(...)` inside a `try/catch` block. Log publishing failures without failing the notification operation.
  - *No Unnecessary Transactions:* Never start a database transaction solely to publish SignalR real-time notifications.
