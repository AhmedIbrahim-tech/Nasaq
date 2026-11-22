using Domain.Enums;

namespace Application.Features.Attendance.DTOs;

public class GeofenceEvaluationResult
{
    public bool IsVerified { get; set; }
    public VerificationStatus Status { get; set; }
    public string? MatchedLocationType { get; set; } // "PersonalLocation", "CompanyLocation", "None"
    public Guid? MatchedLocationId { get; set; }
    public string? MatchedLocationName { get; set; }
    public double? MeasuredDistanceMeters { get; set; }
    public double AppliedRadiusMeters { get; set; } = 50.0;
    public string? FailureReason { get; set; }
}
