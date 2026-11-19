using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace API.Extensions;

public static class WebApplicationExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;

        await InitialiseDatabaseCoreAsync(services, app.Configuration, app.Environment);
    }

    public static Task InitialiseDatabaseCoreAsync(
        IServiceProvider services,
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger? _,
        CancellationToken cancellationToken = default) =>
        InitialiseDatabaseCoreAsync(services, configuration, environment, cancellationToken);

    public static async Task InitialiseDatabaseCoreAsync(
        IServiceProvider services,
        IConfiguration configuration,
        IHostEnvironment environment,
        CancellationToken cancellationToken = default)
    {
        var db = services.GetRequiredService<ApplicationDbContext>();

        var isConfiguredToMigrate = configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup", false);

        if (db.Database.IsRelational())
        {
            var canApplyMigrations = !environment.IsProduction() && isConfiguredToMigrate;

            var pendingMigrations = (await db.Database.GetPendingMigrationsAsync(cancellationToken)).ToList();

            if (canApplyMigrations)
            {
                if (pendingMigrations.Count != 0)
                {
                    await db.Database.MigrateAsync(cancellationToken);
                }
            }
            else
            {
                if (pendingMigrations.Count != 0)
                {
                    var reason = environment.IsProduction()
                        ? "Automatic migration on startup is strictly disabled in Production environments."
                        : "Automatic migration on startup is disabled via configuration (Database:ApplyMigrationsOnStartup = false).";

                    var errorMessage = $"The database has {pendingMigrations.Count} pending migration(s) ({string.Join(", ", pendingMigrations)}). " +
                        $"{reason} Database schema must be updated before the application can start.";

                    if (environment.IsProduction())
                    {
                        throw new InvalidOperationException(errorMessage);
                    }
                }
            }
        }

        var initializer = services.GetRequiredService<DbInitializer>();
        await initializer.SeedAsync();
    }
}
