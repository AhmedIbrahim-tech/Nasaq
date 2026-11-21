namespace Application.Features.Locations.Queries.GetLocationById;

public sealed class GetLocationByIdHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetLocationByIdQuery, GenericBaseResponse<WorkLocationDto>>
{
    public async Task<GenericBaseResponse<WorkLocationDto>> Handle(
        GetLocationByIdQuery request,
        CancellationToken cancellationToken)
    {
        var location = await dbContext.WorkLocations
            .AsNoTracking()
            .Where(w => w.Id == request.Id)
            .Select(w => new WorkLocationDto
            {
                Id = w.Id,
                Name = w.Name,
                NameAr = w.NameAr,
                Address = w.Address,
                AddressAr = w.AddressAr,
                Latitude = w.Latitude,
                Longitude = w.Longitude,
                RadiusMeters = w.RadiusMeters,
                AccuracyThresholdMeters = w.AccuracyThresholdMeters,
                IsActive = w.IsActive,
                AssignedEmployeesCount = w.Employees.Count,
                Created_Utc = w.Created_Utc,
                Created_By = w.Created_By,
                Updated_Utc = w.Updated_Utc,
                Updated_By = w.Updated_By
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (location == null)
        {
            return GenericBaseResponse<WorkLocationDto>.NotFound($"Work location with ID '{request.Id}' was not found.");
        }

        return GenericBaseResponse<WorkLocationDto>.Success(location);
    }
}
