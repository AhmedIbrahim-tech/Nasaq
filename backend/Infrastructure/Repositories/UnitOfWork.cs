using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Repositories;

public sealed class UnitOfWork(ApplicationDbContext context, ILogger<UnitOfWork> logger) : IUnitOfWork
{
    private enum TransactionState
    {
        None,
        Active,
        Committed,
        RolledBack,
        UncertainCommit
    }

    private readonly ApplicationDbContext _context = context;
    private readonly ILogger<UnitOfWork> _logger = logger;
    private readonly List<Func<Task>> _postCommitActions = new();
    private readonly bool _isInMemory = context.Database.ProviderName?.Contains("InMemory", StringComparison.OrdinalIgnoreCase) == true;

    private IDbContextTransaction? _transaction;
    private TransactionState _state = TransactionState.None;

    private IGenericRepository<AppNotification>? _appNotifications;
    private IGenericRepository<Employee>? _employees;

    public IGenericRepository<AppNotification> AppNotifications =>
        _appNotifications ??= new GenericRepository<AppNotification>(_context);

    public IGenericRepository<Employee> Employees =>
        _employees ??= new GenericRepository<Employee>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        await _context.SaveChangesAsync(cancellationToken);

    public bool HasActiveTransaction => _state == TransactionState.Active;

    public void RegisterPostCommitAction(Func<Task> action)
    {
        ArgumentNullException.ThrowIfNull(action);

        if (_state != TransactionState.Active)
        {
            throw new InvalidOperationException("Cannot register a post-commit action without an active database transaction.");
        }

        _postCommitActions.Add(action);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_state == TransactionState.Active)
        {
            return;
        }

        if (_isInMemory)
        {
            _state = TransactionState.Active;
            return;
        }

        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        _state = TransactionState.Active;
    }

    public async Task CommitAsync()
    {
        if (_state != TransactionState.Active)
        {
            return;
        }

        var actions = _postCommitActions.ToList();
        _postCommitActions.Clear();

        try
        {
            if (_transaction is not null)
            {
                await _transaction.CommitAsync();
            }

            _state = TransactionState.Committed;
        }
        catch (Exception ex)
        {
            _state = TransactionState.UncertainCommit;
            actions.Clear();
            _logger.LogError(ex, "Transaction commit failed or outcome is uncertain.");
            throw;
        }
        finally
        {
            if (_transaction is not null)
            {
                try
                {
                    await _transaction.DisposeAsync();
                }
                catch (Exception disposeEx)
                {
                    _logger.LogWarning(disposeEx, "Failed to dispose transaction after commit.");
                }
                _transaction = null;
            }
        }

        foreach (var action in actions)
        {
            try
            {
                await action();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Post-commit action execution failed. The database transaction remains committed.");
            }
        }
    }

    public async Task RollbackAsync()
    {
        _postCommitActions.Clear();

        if (_state == TransactionState.UncertainCommit)
        {
            _context.ChangeTracker.Clear();
            _logger.LogWarning("RollbackAsync invoked on a transaction with an uncertain commit outcome. Database rollback cannot be performed.");
            return;
        }

        if (_state != TransactionState.Active)
        {
            _context.ChangeTracker.Clear();
            return;
        }

        try
        {
            if (_transaction is not null)
            {
                await _transaction.RollbackAsync();
            }

            _state = TransactionState.RolledBack;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to roll back database transaction.");
            throw;
        }
        finally
        {
            if (_transaction is not null)
            {
                try
                {
                    await _transaction.DisposeAsync();
                }
                catch (Exception disposeEx)
                {
                    _logger.LogWarning(disposeEx, "Failed to dispose transaction after rollback.");
                }
                _transaction = null;
            }

            _context.ChangeTracker.Clear();
        }
    }

    public async Task<int> ExecuteInTransactionAsync(Func<Task> action, CancellationToken cancellationToken = default)
    {
        var isRoot = !HasActiveTransaction;
        if (isRoot)
        {
            await BeginTransactionAsync(cancellationToken);
        }

        try
        {
            await action();
            var rows = await SaveChangesAsync(cancellationToken);
            if (isRoot)
            {
                await CommitAsync();
            }
            return rows;
        }
        catch
        {
            if (isRoot)
            {
                await RollbackAsync();
            }
            throw;
        }
    }

    public async ValueTask DisposeAsync()
    {
        _postCommitActions.Clear();
        if (_transaction is not null)
        {
            try
            {
                await _transaction.DisposeAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to dispose database transaction asynchronously.");
            }
            _transaction = null;
        }

        _state = TransactionState.None;
    }

    public void Dispose()
    {
        _postCommitActions.Clear();
        if (_transaction is not null)
        {
            try
            {
                _transaction.Dispose();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to dispose database transaction synchronously.");
            }
            _transaction = null;
        }

        _state = TransactionState.None;
    }
}
