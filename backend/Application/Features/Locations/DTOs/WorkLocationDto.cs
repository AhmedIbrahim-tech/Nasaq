namespace Application.Features.Locations.DTOs;

public class WorkLocationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public string NameEn { get => Name; set => Name = value; }
    public string? Address { get; set; }
    public string? AddressAr { get; set; }
    public string? AddressEn { get => Address; set => Address = value; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RadiusMeters { get; set; }
    public double AccuracyThresholdMeters { get; set; }
    public bool IsActive { get; set; }
    public int AssignedEmployeesCount { get; set; }
    public DateTime Created_Utc { get; set; }
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
