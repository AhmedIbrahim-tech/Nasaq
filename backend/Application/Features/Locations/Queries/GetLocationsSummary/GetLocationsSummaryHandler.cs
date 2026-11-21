namespace Application.Features.Locations.Queries.GetLocationsSummary;

public sealed class GetLocationsSummaryHandler(
    IApplicationDbContext dbContext)
    : IRequestHandler<GetLocationsSummaryQuery, GenericBaseResponse<LocationsSummaryDto>>
{
    public async Task<GenericBaseResponse<LocationsSummaryDto>> Handle(
        GetLocationsSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.WorkLocations.AsNoTracking();

        var total = await query.CountAsync(cancellationToken);
        var active = await query.CountAsync(l => l.IsActive, cancellationToken);
        var inactive = total - active;

        var assignedEmployeesTotal = await dbContext.Employees
            .AsNoTracking()
            .CountAsync(e => e.WorkLocationId != null, cancellationToken);

        var avgRadius = total > 0
            ? await query.AverageAsync(l => l.RadiusMeters, cancellationToken)
            : 0.0;

        var summary = new LocationsSummaryDto
        {
            TotalLocations = total,
            ActiveLocations = active,
            InactiveLocations = inactive,
            AssignedEmployeesTotal = assignedEmployeesTotal,
            AvgGeofenceRadiusMeters = Math.Round(avgRadius, 1)
        };

        return GenericBaseResponse<LocationsSummaryDto>.Success(summary);
    }
}
