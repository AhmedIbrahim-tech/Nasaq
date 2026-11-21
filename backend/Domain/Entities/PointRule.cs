using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class PointRule : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public string NameEn { get => Name; set => Name = value; }
    public string? Description { get; set; }
    public string? DescriptionAr { get; set; }

    public PointCategory Category { get; set; }
    public PointEventType EventType { get; set; }

    public int Points { get; set; }

    public bool IsActive { get; set; } = true;
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public int Version { get; set; } = 1;

    public virtual ICollection<PointTransaction> Transactions { get; set; } = new List<PointTransaction>();

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }

    public string GetName(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(NameAr)
            ? NameAr
            : Name;

    public string? GetDescription(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(DescriptionAr)
            ? DescriptionAr
            : Description;
}
