namespace Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AppNotification> AppNotifications => Set<AppNotification>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ICreationAuditable).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property<DateTime>(nameof(ICreationAuditable.Created_Utc))
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                modelBuilder.Entity(entityType.ClrType)
                    .Property<string>(nameof(ICreationAuditable.Created_By))
                    .HasMaxLength(450)
                    .IsRequired(false);
            }

            if (typeof(IModificationAuditable).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property<DateTime?>(nameof(IModificationAuditable.Updated_Utc))
                    .IsRequired(false);

                modelBuilder.Entity(entityType.ClrType)
                    .Property<string>(nameof(IModificationAuditable.Updated_By))
                    .HasMaxLength(450)
                    .IsRequired(false);
            }
        }
    }
}
