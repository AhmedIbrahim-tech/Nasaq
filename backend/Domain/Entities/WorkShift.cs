namespace Domain.Entities;

public class WorkShift : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string? NameAr { get; set; }

    public string NameEn { get => Name; set => Name = value; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public bool IsOvernight { get; set; }

    public TimeOnly? EarlyStartTime { get; set; }

    public TimeOnly? OnTimeStartTime { get; set; }

    public TimeOnly? LateStartTime { get; set; }

    public TimeOnly? CutoffTime { get; set; }

    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }

    public virtual ICollection<WorkScheduleDay> ScheduleDays { get; set; } = new List<WorkScheduleDay>();

    public double DurationHours
    {
        get
        {
            if (IsOvernight || EndTime <= StartTime)
            {
                var beforeMidnight = TimeSpan.FromHours(24) - StartTime.ToTimeSpan();
                var afterMidnight = EndTime.ToTimeSpan();
                return (beforeMidnight + afterMidnight).TotalHours;
            }
            return (EndTime.ToTimeSpan() - StartTime.ToTimeSpan()).TotalHours;
        }
    }

    public string GetName(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(NameAr)
            ? NameAr
            : Name;
}
