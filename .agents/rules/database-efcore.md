---
trigger: glob
globs: "**/backend/Infrastructure/Data/**/*.cs, **/backend/Domain/Entities/**/*.cs, **/backend/Domain/Identity/**/*.cs"
---

# Database & Entity Framework Core Standards

This rule defines the database architecture, schema design guidelines, and EF Core 10 data access patterns for **CoreStarter**.

---

## 1. Domain Entity Design

- **Clean Entities:** Entities reside in `backend/Domain/Entities/` or `backend/Domain/Identity/`. They must contain zero EF Core attributes or ORM-specific dependencies.
- **Audit Interfaces:** Entities should implement the standard auditing interfaces defined in `backend/Domain/Common/`:
  - `ICreationAuditable`: Exposes `Created_Utc` and `Created_By`.
  - `IModificationAuditable`: Exposes `Updated_Utc` and `Updated_By`.
  - `IAuditableEntity`: Combines both creation and modification auditing.
- **Auditing Interceptor:** Automatic population of audit timestamps and user IDs is handled via `AuditSaveChangesInterceptor` or `OnModelCreating` configuration in `ApplicationDbContext`.

---

## 2. EF Core Entity Configurations

- **Fluent API Exclusively:** Never use Data Annotations (`[Required]`, `[MaxLength]`) in domain entities for database mapping. All table names, column lengths, constraints, and relationships must be defined in dedicated configuration classes implementing `IEntityTypeConfiguration<T>`.
- **Directory Location:** Place configurations in `backend/Infrastructure/Data/Configurations/<EntityName>Configuration.cs`.
- **Automatic Discovery:** Configurations are automatically discovered and registered via:
  ```csharp
  modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
  ```
- **Example Configuration:**
  ```csharp
  public class AppNotificationConfiguration : IEntityTypeConfiguration<AppNotification>
  {
      public void Configure(EntityTypeBuilder<AppNotification> builder)
      {
          builder.ToTable("AppNotifications");
          builder.HasKey(n => n.Id);
          builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
          builder.Property(n => n.Body).IsRequired().HasMaxLength(2000);
          builder.HasIndex(n => new { n.UserId, n.IsRead });
      }
  }
  ```

---

## 3. Relationships & Foreign Keys

- **Explicit Foreign Keys:** Always define explicit foreign key properties (e.g., `UserId`) alongside navigation properties (`User`).
- **Restrict Cascading Deletes:** Avoid implicit cascade deletes on sensitive enterprise tables. Use `DeleteBehavior.Restrict` or `DeleteBehavior.NoAction` to prevent accidental cascading data loss.

---

## 4. Query Performance & EF Core Best Practices

- **No-Tracking for Reads:** Always append `.AsNoTracking()` on read-only queries to prevent change tracker overhead and improve memory performance:
  ```csharp
  var notifications = await context.AppNotifications
      .AsNoTracking()
      .Where(n => n.UserId == userId)
      .ToListAsync(cancellationToken);
  ```
- **Projection (`.Select()`):** Prefer projecting directly to DTOs in queries rather than fetching full entities when only a subset of columns is needed.
- **Pagination:** Always paginate list queries using `IQueryable` extensions (`ApplyPagination`) or standard `Skip`/`Take`. Never load unbounded datasets into memory.
- **Explicit Cancellation:** Always pass `cancellationToken` to all async EF Core operations (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`, `CountAsync`).

---

## 5. Transactions & Unit of Work

- Use `IUnitOfWork` (`backend/Domain/Repositories/IUnitOfWork.cs`) when multiple operations across different repositories or tables must be committed atomically:
  ```csharp
  await unitOfWork.ExecuteInTransactionAsync(async () =>
  {
      // Multiple repository mutations here
      await unitOfWork.SaveChangesAsync(cancellationToken);
  }, cancellationToken);
  ```

---

## 6. Migrations & Database Lifecycle (STRICT RULES)

- **Managing Migrations:** Generate migrations using the standard command:
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
