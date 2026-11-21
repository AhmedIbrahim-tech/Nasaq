namespace Infrastructure.Data.Configurations;

public class WorkScheduleDayConfiguration : IEntityTypeConfiguration<WorkScheduleDay>
{
    public void Configure(EntityTypeBuilder<WorkScheduleDay> builder)
    {
        builder.ToTable("WorkScheduleDays");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.DayOfWeek)
            .IsRequired();

        builder.Property(d => d.IsWorkingDay)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasOne(d => d.Shift)
            .WithMany(s => s.ScheduleDays)
            .HasForeignKey(d => d.WorkShiftId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(d => new { d.WorkScheduleId, d.DayOfWeek })
            .IsUnique();
    }
}
