using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Repositories;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;
    private readonly List<Func<Task>> _postCommitActions = new();
    private IGenericRepository<AppNotification>? _appNotifications;

    public UnitOfWork(ApplicationDbContext context) => _context = context;

    public IGenericRepository<AppNotification> AppNotifications =>
        _appNotifications ??= new GenericRepository<AppNotification>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        await _context.SaveChangesAsync(cancellationToken);

    public bool HasActiveTransaction => _transaction is not null;

    public void RegisterPostCommitAction(Func<Task> action)
    {
        if (action is null)
            return;

        if (_transaction is null)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await action();
                }
                catch
                {
                    // Isolated background failure
                }
            });
            return;
        }

        _postCommitActions.Add(action);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction ??= await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitAsync()
    {
        if (_transaction is null)
            return;

        var actions = _postCommitActions.ToList();
        _postCommitActions.Clear();

        try
        {
            await _transaction.CommitAsync();
        }
        catch
        {
            actions.Clear();
            throw;
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }

        foreach (var action in actions)
        {
            try
            {
                await action();
            }
            catch
            {
                // Isolate failure: post-commit actions must never reverse or fail an already-committed transaction
            }
        }
    }

    public async Task RollbackAsync()
    {
        _postCommitActions.Clear();

        if (_transaction is null)
            return;

        try
        {
            await _transaction.RollbackAsync();
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
            _context.ChangeTracker.Clear();
        }
    }

    public async Task<int> ExecuteInTransactionAsync(Func<Task> action, CancellationToken cancellationToken = default)
    {
        var isRoot = _transaction is null;
        if (isRoot)
            await BeginTransactionAsync(cancellationToken);

        try
        {
            await action();
            var rows = await SaveChangesAsync(cancellationToken);
            if (isRoot)
                await CommitAsync();
            return rows;
        }
        catch
        {
            if (isRoot)
                await RollbackAsync();
            throw;
        }
    }

    public async ValueTask DisposeAsync()
    {
        _postCommitActions.Clear();
        if (_transaction is not null)
            await _transaction.DisposeAsync();
        await _context.DisposeAsync();
    }

    public void Dispose()
    {
        _postCommitActions.Clear();
        _transaction?.Dispose();
        _transaction = null;
        _context.Dispose();
    }
}
