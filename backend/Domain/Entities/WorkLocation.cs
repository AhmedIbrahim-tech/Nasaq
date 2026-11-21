namespace Domain.Entities;

public class WorkLocation : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string? NameAr { get; set; }

    public string NameEn { get => Name; set => Name = value; }

    public string? Address { get; set; }

    public string? AddressAr { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public double RadiusMeters { get; set; } = 150.0;

    public double AccuracyThresholdMeters { get; set; } = 50.0;

    public bool IsActive { get; set; } = true;

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();

    public string GetName(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(NameAr)
            ? NameAr
            : Name;

    public string? GetAddress(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(AddressAr)
            ? AddressAr
            : Address;
}
