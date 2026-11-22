using Application.Abstractions;
using Application.Features.Attendance.DTOs;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Infrastructure.Services;

public class GeofenceService : IGeofenceService
{
    private const double EarthRadiusMeters = 6371000.0;
    private const double DefaultRadiusMeters = 50.0;
    private const double DefaultAccuracyThresholdMeters = 50.0;

    private readonly IApplicationDbContext? _context;

    public GeofenceService(IApplicationDbContext? context = null)
    {
        _context = context;
    }

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

    public async Task<double> GetGlobalRadiusMetersAsync(CancellationToken cancellationToken = default)
    {
        if (_context == null) return DefaultRadiusMeters;

        var setting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == "GlobalGeofenceRadiusMeters", cancellationToken);

        if (setting != null && double.TryParse(setting.Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var radius) && radius > 0)
        {
            return radius;
        }

        return DefaultRadiusMeters;
    }

    public async Task<GeofenceEvaluationResult> EvaluateAttendanceCoordinatesAsync(
        double? latitude,
        double? longitude,
        double? accuracyMeters,
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        var globalRadius = await GetGlobalRadiusMetersAsync(cancellationToken);

        // Case 4: GPS Unavailable / Invalid
        if (!IsValidCoordinate(latitude, longitude))
        {
            return new GeofenceEvaluationResult
            {
                IsVerified = false,
                Status = VerificationStatus.PendingReview,
                AppliedRadiusMeters = globalRadius,
                FailureReason = "gps_unavailable: device coordinates were not provided or invalid"
            };
        }

        var lat = latitude!.Value;
        var lon = longitude!.Value;

        // Case 5: GPS Accuracy Insufficient
        if (accuracyMeters.HasValue && accuracyMeters.Value > DefaultAccuracyThresholdMeters)
        {
            return new GeofenceEvaluationResult
            {
                IsVerified = false,
                Status = VerificationStatus.PendingReview,
                AppliedRadiusMeters = globalRadius,
                FailureReason = $"low_accuracy: device reported {accuracyMeters.Value:F1}m, threshold is {DefaultAccuracyThresholdMeters:F1}m"
            };
        }

        if (_context == null)
        {
            return new GeofenceEvaluationResult
            {
                IsVerified = false,
                Status = VerificationStatus.PendingReview,
                AppliedRadiusMeters = globalRadius,
                FailureReason = "context_unavailable: database context not provided"
            };
        }

        double? minDistance = null;

        // 1. Evaluate Employee's Approved Personal Location (Case 1)
        var approvedPersonalLoc = await _context.EmployeePersonalLocations
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.IsActive && p.IsApproved, cancellationToken);

        if (approvedPersonalLoc != null && IsValidCoordinate(approvedPersonalLoc.Latitude, approvedPersonalLoc.Longitude))
        {
            var distPersonal = CalculateDistanceMeters(lat, lon, approvedPersonalLoc.Latitude, approvedPersonalLoc.Longitude);
            minDistance = distPersonal;

            if (distPersonal <= globalRadius)
            {
                return new GeofenceEvaluationResult
                {
                    IsVerified = true,
                    Status = VerificationStatus.Verified,
                    MatchedLocationType = "PersonalLocation",
                    MatchedLocationId = approvedPersonalLoc.Id,
                    MatchedLocationName = approvedPersonalLoc.AddressDescription ?? "Personal Registered Location",
                    MeasuredDistanceMeters = Math.Round(distPersonal, 1),
                    AppliedRadiusMeters = globalRadius
                };
            }
        }

        // 2. Evaluate ANY Active Company Work Location with Valid Coordinates (Case 2)
        var activeCompanyLocs = await _context.WorkLocations
            .AsNoTracking()
            .Where(w => w.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var loc in activeCompanyLocs)
        {
            if (!IsValidCoordinate(loc.Latitude, loc.Longitude))
                continue;

            var dist = CalculateDistanceMeters(lat, lon, loc.Latitude, loc.Longitude);
            if (!minDistance.HasValue || dist < minDistance.Value)
            {
                minDistance = dist;
            }

            if (dist <= globalRadius)
            {
                return new GeofenceEvaluationResult
                {
                    IsVerified = true,
                    Status = VerificationStatus.Verified,
                    MatchedLocationType = "CompanyLocation",
                    MatchedLocationId = loc.Id,
                    MatchedLocationName = loc.Name,
                    MeasuredDistanceMeters = Math.Round(dist, 1),
                    AppliedRadiusMeters = globalRadius
                };
            }
        }

        // Case 3 / Case 6 / Case 7: Outside All Approved Locations
        var distReported = minDistance.HasValue ? Math.Round(minDistance.Value, 1) : (double?)null;
        var distMsg = distReported.HasValue ? $"{distReported.Value}m from nearest approved location" : "no registered locations within range";

        return new GeofenceEvaluationResult
        {
            IsVerified = false,
            Status = VerificationStatus.PendingReview,
            MeasuredDistanceMeters = distReported,
            AppliedRadiusMeters = globalRadius,
            FailureReason = $"outside_geofence: {distMsg} (radius: {globalRadius:F0}m)"
        };
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
}
