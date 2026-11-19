using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Repositories;

public interface IUnitOfWork : IAsyncDisposable, IDisposable
{
    IGenericRepository<AppNotification> AppNotifications { get; }
    IGenericRepository<Employee> Employees { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    bool HasActiveTransaction { get; }

    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitAsync();
    Task RollbackAsync();
    Task<int> ExecuteInTransactionAsync(Func<Task> action, CancellationToken cancellationToken = default);
    void RegisterPostCommitAction(Func<Task> action);
}
