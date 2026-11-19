using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Infrastructure.Data.Interceptors;

public sealed class AuditSaveChangesInterceptor(ICurrentUser currentUser) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateAuditMetadata(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        UpdateAuditMetadata(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void UpdateAuditMetadata(DbContext? context)
    {
        if (context is null) return;

        var utcNow = DateTime.UtcNow;
        var currentUserId = currentUser.IsAuthenticated ? currentUser.UserId : null;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity is ICreationAuditable creationAuditable)
                {
                    if (creationAuditable.Created_Utc == default)
                    {
                        creationAuditable.Created_Utc = utcNow;
                    }

                    if (string.IsNullOrWhiteSpace(creationAuditable.Created_By) && !string.IsNullOrWhiteSpace(currentUserId))
                    {
                        creationAuditable.Created_By = currentUserId;
                    }
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                if (entry.Entity is ICreationAuditable)
                {
                    entry.Property(nameof(ICreationAuditable.Created_Utc)).IsModified = false;
                    entry.Property(nameof(ICreationAuditable.Created_By)).IsModified = false;
                }

                if (entry.Entity is IModificationAuditable modificationAuditable)
                {
                    var hasNonAuditChanges = entry.Properties.Any(p =>
                        p.IsModified &&
                        p.Metadata.Name != nameof(IModificationAuditable.Updated_Utc) &&
                        p.Metadata.Name != nameof(IModificationAuditable.Updated_By));

                    if (hasNonAuditChanges)
                    {
                        modificationAuditable.Updated_Utc = utcNow;
                        if (!string.IsNullOrWhiteSpace(currentUserId))
                        {
                            modificationAuditable.Updated_By = currentUserId;
                        }
                    }
                }
            }
        }
    }
}
