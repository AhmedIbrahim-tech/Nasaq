using Application.Features.Attendance.DTOs;

namespace Application.Abstractions;

public interface IGeofenceService
{
    /// <summary>
    /// Calculates the geodesic distance in meters between two coordinates using the Haversine formula.
    /// </summary>
    double CalculateDistanceMeters(double lat1, double lon1, double lat2, double lon2);

    /// <summary>
    /// Checks if the given coordinates are within the target location's geofence radius.
    /// </summary>
    bool IsWithinGeofence(double employeeLat, double employeeLon, double targetLat, double targetLon, double radiusMeters, out double distanceMeters);

    /// <summary>
    /// Validates if coordinates are geographically valid (-90 <= lat <= 90, -180 <= lon <= 180).
    /// </summary>
    bool IsValidCoordinate(double? latitude, double? longitude);

    /// <summary>
    /// Gets the global geofence radius in meters from system settings, defaulting to 50.0m.
    /// </summary>
    Task<double> GetGlobalRadiusMetersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Evaluates attendance coordinates against both the employee's approved personal location
    /// and ANY active company Work Location with valid coordinates, using the global radius.
    /// </summary>
    Task<GeofenceEvaluationResult> EvaluateAttendanceCoordinatesAsync(
        double? latitude,
        double? longitude,
        double? accuracyMeters,
        Guid employeeId,
        CancellationToken cancellationToken = default);
}
