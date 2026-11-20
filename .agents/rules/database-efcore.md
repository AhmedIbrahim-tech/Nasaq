---
trigger: glob
globs: "**/backend/Infrastructure/Data/**/*.cs, **/backend/Domain/Entities/**/*.cs, **/backend/Domain/Identity/**/*.cs"
---

# Database & Entity Framework Core Standards

This rule defines the database architecture, schema design guidelines, and EF Core 10 data access patterns for **NASAQ**.

---

## 1. Domain Entity Design

- **Clean Entities:** Entities reside in `backend/Domain/Entities/` or `backend/Domain/Identity/`. They must contain zero EF Core attributes or ORM-specific dependencies.
- **No Binary Blobs in Business Tables:** Never store image binary or file byte arrays in business tables. Large assets belong on disk through `IFileService`, with metadata in `StoredFiles`. For example:
  ```csharp
  public Guid? ProfilePhoto { get; set; } // References StoredFiles.Id
  ```
- **Audit Interfaces:** Entities should implement the standard auditing interfaces defined in `backend/Domain/Common/`:
  - `ICreationAuditable`: Exposes `Created_Utc` and `Created_By`.
  - `IModificationAuditable`: Exposes `Updated_Utc` and `Updated_By`.
  - `IAuditableEntity`: Combines both creation and modification auditing.
- **Auditing Interceptor:** Automatic population of audit timestamps and user IDs is handled via `AuditSaveChangesInterceptor` registered in `Infrastructure.DependencyInjection`.

---

## 2. EF Core Entity Configurations

- **Fluent API Exclusively:** Never use Data Annotations (`[Required]`, `[MaxLength]`) in domain entities for database mapping. All table names, column lengths, constraints, and relationships must be defined in dedicated configuration classes implementing `IEntityTypeConfiguration<T>`.
- **Directory Location:** Place configurations in `backend/Infrastructure/Data/Configurations/<EntityName>Configuration.cs`.
- **Automatic Discovery:** Configurations are automatically discovered and registered via:
  ```csharp
  modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
  ```

---

## 3. Relationships & Foreign Keys

- **Explicit Foreign Keys:** Always define explicit foreign key properties (e.g., `UserId`, `SupervisorId`) alongside navigation properties (`User`, `Supervisor`).
- **Restrict Cascading Deletes:** Avoid implicit cascade deletes on sensitive enterprise tables. Use `DeleteBehavior.Restrict` or `DeleteBehavior.NoAction` to prevent accidental cascading data loss.
- **File Reference Relationships:** When an entity references a `StoredFile` (e.g., `Employee.ProfilePhoto`), configure `DeleteBehavior.SetNull` or `DeleteBehavior.Restrict` to prevent accidental cascade deletion of business records.

---

## 4. Query Performance & EF Core Best Practices

- **No-Tracking for Reads:** Always append `.AsNoTracking()` on read-only queries to prevent change tracker overhead and improve memory performance:
  ```csharp
  var employees = await context.Employees
      .AsNoTracking()
      .Where(e => e.IsActive)
      .ToListAsync(cancellationToken);
  ```
- **Projection (`.Select()`):** Prefer projecting directly to DTOs in queries rather than fetching full entities when only a subset of columns is needed.
- **Pagination:** Always paginate list queries using standard `Skip`/`Take`. Never load unbounded datasets into memory.
- **Explicit Cancellation:** Always pass `cancellationToken` to all async EF Core operations (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`, `CountAsync`).

---

## 5. Transactions, Identity Integration & Unit of Work Lifecycle

### 5.1 Shared Scoped DbContext
- ASP.NET Core Identity (`UserManager`, `RoleManager`), domain entities (`Employee`, `StoredFile`), and `UnitOfWork` all share the same scoped `ApplicationDbContext`.
- Mutations performed through `UserManager` or EF Core repositories participate in the same underlying database connection and transaction.

### 5.2 Atomic Operations & Rollback Safety
- **Transaction Initiation:** Start the database transaction via `IUnitOfWork.BeginTransactionAsync` before executing Identity account creation or business mutations that must succeed or fail together.
- **Check Every IdentityResult:** Always check `result.Succeeded`. If failed, do not proceed with subsequent mutations; trigger a transaction rollback.
- **Database Rollback is Authoritative:** Invoking `IUnitOfWork.RollbackAsync()` (or failing an `ExecuteInTransactionAsync` delegate) rolls back all SQL operations across both Identity tables (`AspNetUsers`, `AspNetUserRoles`) and application tables.
- **Elimination of Manual Compensation:** Do NOT invoke manual Identity compensation operations (such as manually calling `userManager.DeleteAsync` or removing roles) after a successful database rollback. Doing so is redundant, unsafe, and causes entity tracking or concurrency conflicts.
- **No SaveChangesAsync on Rolled Back State:** Never call `SaveChangesAsync` to attempt reversal after a database rollback.
- **Change Tracker Cleared:** `RollbackAsync` automatically invokes `_context.ChangeTracker.Clear()` to eliminate detached or ghost entity states.

### 5.3 Physical Files vs Database Transactions
- SQL transactions do NOT govern physical disk writes.
- File-writing workflows (e.g., creating/updating employee profile photos) must track newly saved physical files and remove them from disk only if the database transaction rolls back.
- If a transaction commit outcome is uncertain, preserve physical files on disk to prevent data loss.
- Never roll back a database transaction that has already committed successfully.

### 5.4 Post-Commit Execution & RegisterPostCommitAction
- **Strict Active Transaction Requirement:** `IUnitOfWork.RegisterPostCommitAction(Func<Task> action)` strictly requires an active transaction (`HasActiveTransaction == true`). Calling it when no transaction is active throws `InvalidOperationException`.
- **Sequential Post-Commit Execution:** Registered actions are executed sequentially and awaited only after a confirmed successful database commit.
- **No Fire-and-Forget:** Do NOT use `Task.Run` for post-commit actions.
- **Failure Isolation:** Any exception thrown inside a post-commit action is logged (`_logger.LogError`) and swallowed to ensure the already committed database transaction is never affected.
- **Discarded on Rollback:** All registered callbacks are immediately cleared on transaction rollback.

---

## 6. Migrations & Database Lifecycle (STRICT RULES)

- **Managing Migrations:** Generate migrations using:
  ```bash
  dotnet ef migrations add <DescriptiveName> --project backend/Infrastructure --startup-project backend/API --output-dir Data/Migrations
  ```
- **Applying Migrations:** Update the database using:
  ```bash
  dotnet ef database update --project backend/Infrastructure --startup-project backend/API
  ```
- **SAFETY RULES (CRITICAL):**
  1. **NEVER delete existing migrations** from `backend/Infrastructure/Data/Migrations/`.
  2. **NEVER edit `ApplicationDbContextModelSnapshot.cs` manually**.
  3. **NEVER execute destructive database commands** (`DROP DATABASE`, `DROP TABLE`, `TRUNCATE`) or remove columns without explicit approval from the user.
  4. **NO Demo Data Seeding:** Do not inject random demo records, test catalogs, or placeholder business entities into production migrations or database seeders. Seeding is reserved strictly for system roles and primary admin credentials via `DbInitializer`.
