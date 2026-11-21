namespace Application.Features.Employees.Commands.BulkDeleteEmployees;

public sealed class BulkDeleteEmployeesHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork)
    : IRequestHandler<BulkDeleteEmployeesCommand, GenericBaseResponse<int>>
{
    public async Task<GenericBaseResponse<int>> Handle(
        BulkDeleteEmployeesCommand request,
        CancellationToken cancellationToken)
    {
        var distinctIds = request.Ids.Distinct().ToList();
        if (distinctIds.Count == 0)
        {
            return GenericBaseResponse<int>.Fail("No employee IDs were provided for deletion.", HttpStatusCode.BadRequest);
        }

        var employees = await dbContext.Employees
            .Where(e => distinctIds.Contains(e.Id))
            .ToListAsync(cancellationToken);

        if (employees.Count == 0)
        {
            return GenericBaseResponse<int>.NotFound("None of the specified employees were found.");
        }

        // Prevent deletion if any selected employee is a supervisor to employees outside the deletion set
        var supervisingCount = await dbContext.Employees
            .AsNoTracking()
            .CountAsync(e => e.SupervisorId.HasValue 
                && distinctIds.Contains(e.SupervisorId.Value) 
                && !distinctIds.Contains(e.Id), cancellationToken);

        if (supervisingCount > 0)
        {
            return GenericBaseResponse<int>.Fail(
                $"Cannot complete bulk deletion: {supervisingCount} employee(s) in the organization report to employees in this selection. Please reassign supervised staff first.",
                HttpStatusCode.BadRequest);
        }

        // Atomic all-or-nothing transaction
        await unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            foreach (var employee in employees)
            {
                unitOfWork.Employees.Remove(employee);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            await unitOfWork.CommitAsync();
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }

        return GenericBaseResponse<int>.Success(employees.Count, $"Successfully deleted {employees.Count} employee(s).");
    }
}
