using Infrastructure.Services;
using Xunit;

namespace Tests.Attendance;

public class GeofenceServiceTests
{
    private readonly GeofenceService _geofenceService = new();

    [Fact]
    public void CalculateDistanceMeters_SameCoordinates_ReturnsZero()
    {
        var distance = _geofenceService.CalculateDistanceMeters(24.7136, 46.6753, 24.7136, 46.6753);
        Assert.Equal(0, distance);
    }

    [Fact]
    public void CalculateDistanceMeters_KnownCoordinates_ReturnsExpectedDistance()
    {
        // Riyadh Kingdom Centre to Al Faisaliah Centre (~2.7 km = 2700m approx)
        var lat1 = 24.7114;
        var lon1 = 46.6744;
        var lat2 = 24.6901;
        var lon2 = 46.6853;

        var distance = _geofenceService.CalculateDistanceMeters(lat1, lon1, lat2, lon2);
        Assert.InRange(distance, 2500, 3000);
    }

    [Fact]
    public void IsWithinGeofence_InsideRadius_ReturnsTrue()
    {
        var centerLat = 24.7136;
        var centerLon = 46.6753;
        // Shift by ~50 meters
        var userLat = 24.7138;
        var userLon = 46.6755;

        var inside = _geofenceService.IsWithinGeofence(userLat, userLon, centerLat, centerLon, 100, out var distance);
        Assert.True(inside);
        Assert.True(distance <= 100);
    }

    [Fact]
    public void IsWithinGeofence_OutsideRadius_ReturnsFalse()
    {
        var centerLat = 24.7136;
        var centerLon = 46.6753;
        // Shift by ~500 meters
        var userLat = 24.7180;
        var userLon = 46.6790;

        var inside = _geofenceService.IsWithinGeofence(userLat, userLon, centerLat, centerLon, 100, out var distance);
        Assert.False(inside);
        Assert.True(distance > 100);
    }

    [Theory]
    [InlineData(24.7136, 46.6753, true)]
    [InlineData(-90.0, 180.0, true)]
    [InlineData(91.0, 46.0, false)]
    [InlineData(24.0, 181.0, false)]
    [InlineData(null, 46.0, false)]
    [InlineData(24.0, null, false)]
    public void IsValidCoordinate_ValidatesBoundsCorrectly(double? lat, double? lon, bool expected)
    {
        var valid = _geofenceService.IsValidCoordinate(lat, lon);
        Assert.Equal(expected, valid);
    }
}
