using Application.Abstractions;

namespace Infrastructure.Services;

public class GeofenceService : IGeofenceService
{
    private const double EarthRadiusMeters = 6371000.0;

    public double CalculateDistanceMeters(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var rLat1 = ToRadians(lat1);
        var rLat2 = ToRadians(lat2);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(rLat1) * Math.Cos(rLat2) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return Math.Round(EarthRadiusMeters * c, 2);
    }

    public bool IsWithinGeofence(double employeeLat, double employeeLon, double targetLat, double targetLon, double radiusMeters, out double distanceMeters)
    {
        distanceMeters = CalculateDistanceMeters(employeeLat, employeeLon, targetLat, targetLon);
        return distanceMeters <= radiusMeters;
    }

    public bool IsValidCoordinate(double? latitude, double? longitude)
    {
        if (!latitude.HasValue || !longitude.HasValue) return false;
        if (double.IsNaN(latitude.Value) || double.IsInfinity(latitude.Value)) return false;
        if (double.IsNaN(longitude.Value) || double.IsInfinity(longitude.Value)) return false;

        return latitude.Value is >= -90.0 and <= 90.0 &&
               longitude.Value is >= -180.0 and <= 180.0;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
}
