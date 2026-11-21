namespace Application.Features.Locations.Commands.UpdateLocation;

public sealed class UpdateLocationHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateLocationCommand, GenericBaseResponse<WorkLocationDto>>
{
    public async Task<GenericBaseResponse<WorkLocationDto>> Handle(
        UpdateLocationCommand request,
        CancellationToken cancellationToken)
    {
        var location = await dbContext.WorkLocations
            .Include(w => w.Employees)
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        if (location == null)
        {
            return GenericBaseResponse<WorkLocationDto>.NotFound($"Work location with ID '{request.Id}' was not found.");
        }

        var normalizedName = request.Name.Trim();

        if (!string.Equals(location.Name, normalizedName, StringComparison.OrdinalIgnoreCase))
        {
            var nameExists = await dbContext.WorkLocations
                .AsNoTracking()
                .AnyAsync(w => w.Name.ToLower() == normalizedName.ToLower() && w.Id != request.Id, cancellationToken);

            if (nameExists)
            {
                return GenericBaseResponse<WorkLocationDto>.Conflict($"A work location with the name '{normalizedName}' already exists.");
            }
        }

        location.Name = normalizedName;
        if (request.NameAr != null) location.NameAr = request.NameAr.Trim();
        if (request.Address != null) location.Address = request.Address.Trim();
        if (request.AddressAr != null) location.AddressAr = request.AddressAr.Trim();
        location.Latitude = request.Latitude;
        location.Longitude = request.Longitude;
        location.RadiusMeters = request.RadiusMeters;
        location.AccuracyThresholdMeters = request.AccuracyThresholdMeters;
        location.IsActive = request.IsActive;

        unitOfWork.WorkLocations.Update(location);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WorkLocationDto
        {
            Id = location.Id,
            Name = location.Name,
            NameAr = location.NameAr,
            Address = location.Address,
            AddressAr = location.AddressAr,
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

        return GenericBaseResponse<WorkLocationDto>.Success(dto, "Work location updated successfully.");
    }
}
