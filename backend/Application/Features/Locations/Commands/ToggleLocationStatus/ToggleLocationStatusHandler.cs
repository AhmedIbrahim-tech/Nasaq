namespace Application.Features.Locations.Commands.ToggleLocationStatus;

public sealed class ToggleLocationStatusHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork)
    : IRequestHandler<ToggleLocationStatusCommand, GenericBaseResponse<WorkLocationDto>>
{
    public async Task<GenericBaseResponse<WorkLocationDto>> Handle(
        ToggleLocationStatusCommand request,
        CancellationToken cancellationToken)
    {
        var location = await dbContext.WorkLocations
            .Include(w => w.Employees)
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        if (location == null)
        {
            return GenericBaseResponse<WorkLocationDto>.NotFound($"Work location with ID '{request.Id}' was not found.");
        }

        var newStatus = request.IsActive ?? !location.IsActive;
        location.IsActive = newStatus;

        unitOfWork.WorkLocations.Update(location);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WorkLocationDto
        {
            Id = location.Id,
            Name = location.Name,
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            RadiusMeters = location.RadiusMeters,
            AccuracyThresholdMeters = location.AccuracyThresholdMeters,
            IsActive = location.IsActive,
            AssignedEmployeesCount = location.Employees.Count,
            Created_Utc = location.Created_Utc,
            Created_By = location.Created_By,
            Updated_Utc = location.Updated_Utc,
            Updated_By = location.Updated_By
        };

        var message = newStatus ? "Work location activated successfully." : "Work location deactivated successfully.";
        return GenericBaseResponse<WorkLocationDto>.Success(dto, message);
    }
}
