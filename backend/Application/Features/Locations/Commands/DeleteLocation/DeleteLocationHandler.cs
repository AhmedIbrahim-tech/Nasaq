namespace Application.Features.Locations.Commands.DeleteLocation;

public sealed class DeleteLocationHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteLocationCommand, GenericBaseResponse<object?>>
{
    public async Task<GenericBaseResponse<object?>> Handle(
        DeleteLocationCommand request,
        CancellationToken cancellationToken)
    {
        var location = await dbContext.WorkLocations
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        if (location == null)
        {
            return GenericBaseResponse<object?>.NotFound($"Work location with ID '{request.Id}' was not found.");
        }

        // Referential integrity check: Restrict prevents cascade on WorkLocationId
        var assignedEmployeesCount = await dbContext.Employees
            .AsNoTracking()
            .CountAsync(e => e.WorkLocationId == request.Id, cancellationToken);

        if (assignedEmployeesCount > 0)
        {
            return GenericBaseResponse<object?>.Fail(
                $"Cannot delete work location '{location.Name}' because it currently has {assignedEmployeesCount} employee(s) assigned to it. Please reassign the employees first.",
                HttpStatusCode.BadRequest);
        }

        unitOfWork.WorkLocations.Remove(location);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<object?>.Success(null, "Work location deleted successfully.");
    }
}
