namespace Infrastructure.Data.Configurations;

public class EmployeeScheduleAssignmentConfiguration : IEntityTypeConfiguration<EmployeeScheduleAssignment>
{
    public void Configure(EntityTypeBuilder<EmployeeScheduleAssignment> builder)
    {
        builder.ToTable("EmployeeScheduleAssignments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.EffectiveFrom)
            .IsRequired();

        builder.Property(a => a.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(a => a.Notes)
            .HasMaxLength(500);

        builder.Property(a => a.Created_Utc)
            .IsRequired();

        builder.Property(a => a.Created_By)
            .HasMaxLength(450);

        builder.Property(a => a.Updated_By)
            .HasMaxLength(450);

        builder.HasOne(a => a.Employee)
            .WithMany(e => e.ScheduleAssignments)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Schedule)
            .WithMany(s => s.EmployeeAssignments)
            .HasForeignKey(a => a.WorkScheduleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => a.EmployeeId);
        builder.HasIndex(a => a.WorkScheduleId);
        builder.HasIndex(a => a.EffectiveFrom);
        builder.HasIndex(a => a.IsActive);
    }
}
