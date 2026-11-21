namespace Application.Features.Locations.Commands.BulkDeleteLocations;

public sealed class BulkDeleteLocationsHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork)
    : IRequestHandler<BulkDeleteLocationsCommand, GenericBaseResponse<int>>
{
    public async Task<GenericBaseResponse<int>> Handle(
        BulkDeleteLocationsCommand request,
        CancellationToken cancellationToken)
    {
        var distinctIds = request.Ids.Distinct().ToList();
        if (distinctIds.Count == 0)
        {
            return GenericBaseResponse<int>.Fail("No work location IDs were provided for deletion.", HttpStatusCode.BadRequest);
        }

        var locations = await dbContext.WorkLocations
            .Where(w => distinctIds.Contains(w.Id))
            .ToListAsync(cancellationToken);

        if (locations.Count == 0)
        {
            return GenericBaseResponse<int>.NotFound("None of the specified work locations were found.");
        }

        // Check if any selected location has assigned employees
        var hasAssignedEmployees = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.WorkLocationId.HasValue && distinctIds.Contains(e.WorkLocationId.Value), cancellationToken);

        if (hasAssignedEmployees)
        {
            return GenericBaseResponse<int>.Fail(
                "Cannot delete selected work locations because one or more locations currently have employees assigned to them. Please reassign all employees first.",
                HttpStatusCode.BadRequest);
        }

        // Atomic all-or-nothing transaction
        await unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            foreach (var loc in locations)
            {
                unitOfWork.WorkLocations.Remove(loc);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            await unitOfWork.CommitAsync();
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }

        return GenericBaseResponse<int>.Success(locations.Count, $"Successfully deleted {locations.Count} work location(s).");
    }
}
