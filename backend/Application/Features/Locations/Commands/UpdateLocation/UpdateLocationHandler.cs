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

        var nameAr = !string.IsNullOrWhiteSpace(request.NameAr) ? request.NameAr.Trim() : null;
        var nameEn = !string.IsNullOrWhiteSpace(request.NameEn)
            ? request.NameEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Name) ? request.Name.Trim() : (nameAr ?? string.Empty));
        var addressAr = !string.IsNullOrWhiteSpace(request.AddressAr) ? request.AddressAr.Trim() : null;
        var addressEn = !string.IsNullOrWhiteSpace(request.AddressEn)
            ? request.AddressEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Address) ? request.Address.Trim() : null);

        var normalizedName = nameEn;

        var nameExists = await dbContext.WorkLocations
            .AsNoTracking()
            .AnyAsync(w => w.Id != request.Id &&
                           ((w.Name.ToLower() == normalizedName.ToLower()) ||
                            (nameAr != null && w.NameAr != null && w.NameAr.ToLower() == nameAr.ToLower())),
                      cancellationToken);

        if (nameExists)
        {
            return GenericBaseResponse<WorkLocationDto>.Conflict($"A work location with the name '{normalizedName}' already exists.");
        }

        location.Name = normalizedName;
        location.NameAr = nameAr;
        location.Address = addressEn;
        location.AddressAr = addressAr;
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
