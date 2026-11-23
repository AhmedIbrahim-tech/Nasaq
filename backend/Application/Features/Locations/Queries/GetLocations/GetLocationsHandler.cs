namespace Application.Features.Locations.Queries.GetLocations;

public sealed class GetLocationsHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetLocationsQuery, GenericBaseResponse<IReadOnlyList<WorkLocationDto>>>
{
    public async Task<GenericBaseResponse<IReadOnlyList<WorkLocationDto>>> Handle(
        GetLocationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.WorkLocations
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(w => w.Name.ToLower().Contains(search) ||
                                     (w.NameAr != null && w.NameAr.ToLower().Contains(search)) ||
                                     (w.Address != null && w.Address.ToLower().Contains(search)) ||
                                     (w.AddressAr != null && w.AddressAr.ToLower().Contains(search)));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(w => w.IsActive == request.IsActive.Value);
        }

        var locations = await query
            .OrderBy(w => w.Name)
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
            .ToListAsync(cancellationToken);

        return GenericBaseResponse<IReadOnlyList<WorkLocationDto>>.Success(locations);
    }
}
