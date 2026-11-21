namespace Application.Features.Locations.DTOs;

public sealed record LocationsSummaryDto
{
    public int TotalLocations { get; init; }
    public int ActiveLocations { get; init; }
    public int InactiveLocations { get; init; }
    public int AssignedEmployeesTotal { get; init; }
    public double AvgGeofenceRadiusMeters { get; init; }
}
