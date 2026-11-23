namespace Application.Features.Locations.Commands.CreateLocation;

public sealed class CreateLocationHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateLocationCommand, GenericBaseResponse<WorkLocationDto>>
{
    public async Task<GenericBaseResponse<WorkLocationDto>> Handle(
        CreateLocationCommand request,
        CancellationToken cancellationToken)
    {
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
            .AnyAsync(w => (w.Name.ToLower() == normalizedName.ToLower()) ||
                           (nameAr != null && w.NameAr != null && w.NameAr.ToLower() == nameAr.ToLower()),
                      cancellationToken);

        if (nameExists)
        {
            return GenericBaseResponse<WorkLocationDto>.Conflict($"A work location with the name '{normalizedName}' already exists.");
        }

        var location = new WorkLocation
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
            NameAr = nameAr,
            Address = addressEn,
            AddressAr = addressAr,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            RadiusMeters = request.RadiusMeters,
            AccuracyThresholdMeters = request.AccuracyThresholdMeters,
            IsActive = request.IsActive,
            Created_Utc = DateTime.UtcNow
        };

        await unitOfWork.WorkLocations.AddAsync(location, cancellationToken);
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
            AssignedEmployeesCount = 0,
            Created_Utc = location.Created_Utc,
            Created_By = location.Created_By,
            Updated_Utc = location.Updated_Utc,
            Updated_By = location.Updated_By
        };

        return GenericBaseResponse<WorkLocationDto>.Created(dto, "Work location created successfully.");
    }
}
