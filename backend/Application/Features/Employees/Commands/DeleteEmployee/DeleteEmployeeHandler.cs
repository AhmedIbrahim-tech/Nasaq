namespace Application.Features.Employees.Commands.DeleteEmployee;

public sealed class DeleteEmployeeHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteEmployeeCommand, GenericBaseResponse<object?>>
{
    public async Task<GenericBaseResponse<object?>> Handle(
        DeleteEmployeeCommand request,
        CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<object?>.NotFound($"Employee with ID '{request.Id}' was not found.");
        }

        // Referential integrity check: Restrict prevents cascade on Supervisor relationship
        var hasSupervised = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.SupervisorId == request.Id, cancellationToken);

        if (hasSupervised)
        {
            return GenericBaseResponse<object?>.Fail(
                "Cannot delete employee because they are assigned as a direct supervisor to other active employees. Please reassign the supervised employees first.",
                HttpStatusCode.BadRequest);
        }

        unitOfWork.Employees.Remove(employee);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<object?>.Success(null, "Employee deleted successfully.");
    }
}
