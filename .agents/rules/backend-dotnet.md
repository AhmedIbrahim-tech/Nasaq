---
trigger: glob
globs: "**/backend/**/*.cs, **/backend/**/*.csproj, **/backend/**/*.json"
---

# Backend .NET 10 Engineering Standards

This rule defines the coding conventions, design patterns, and engineering practices for the .NET 10 backend solution (`CoreStarter.sln`).

---

## 1. C# 13 & Language Features

- **File-Scoped Namespaces:** Always use file-scoped namespaces (e.g., `namespace Application.Features.Auth;`).
- **Primary Constructors:** Use primary constructors on classes, handlers, and records:
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

  public sealed record MarkNotificationReadCommand(string NotificationId, string UserId)
      : IRequest<GenericBaseResponse<bool>>;
  ```
- Place each Command and Query in its own dedicated directory:
  `Features/<ModuleName>/Commands/<ActionName>/<ActionName>Command.cs`
  `Features/<ModuleName>/Queries/<QueryName>/<QueryName>Query.cs`

### 2.2 Handlers
- Handlers must be `sealed class` implementing `IRequestHandler<TRequest, TResponse>`.
- Keep handlers thin: orchestrate domain operations or delegate to domain/infrastructure services.
- Never write direct SQL or database mutations inside API controllers; all execution flows through MediatR handlers.

---

## 3. Validation Pipeline

- Every Command that accepts user input must have a corresponding FluentValidation validator inheriting from `AbstractValidator<T>`:
  ```csharp
  public sealed class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
  {
      public ChangePasswordRequestValidator()
      {
          RuleFor(x => x.OldPassword).NotEmpty().WithMessage("Current password is required.");
          RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8);
      }
  }
  ```
- Validation is executed automatically before the handler via `ValidationBehavior<TRequest, TResponse>`.
- Validation errors are mapped automatically to `GenericBaseResponse<T>.ValidationFail(...)`.

---

## 4. API Controllers & Routing

### 4.1 Base Controller
- All controllers must inherit from `ApiControllerBase` (`backend/API/Controllers/Base/ApiControllerBase.cs`).
- Use `[ApiController]` attribute on all controller classes.
- Use `ActionResult(response)` helper to automatically map the HTTP status code from `response.StatusCode`:
  ```csharp
  [ApiController]
  public sealed class AuthController : ApiControllerBase
  {
      [HttpPost(Router.Auth.Login)]
      public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken) =>
          ActionResult(await _mediator.Send(new LoginCommand(request), cancellationToken));
  }
  ```

### 4.2 Centralized Routing
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
  - `Scoped`: DbContext, UnitOfWork, Repositories, CurrentUser, AuthService.
  - `Transient`: MediatR handlers, Validators, transient helpers.
  - `Singleton`: Static helpers, stateless utilities.

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
