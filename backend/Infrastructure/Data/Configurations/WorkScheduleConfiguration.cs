namespace Infrastructure.Data.Configurations;

public class WorkScheduleConfiguration : IEntityTypeConfiguration<WorkSchedule>
{
    public void Configure(EntityTypeBuilder<WorkSchedule> builder)
    {
        builder.ToTable("WorkSchedules");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(s => s.NameAr)
            .HasMaxLength(150);

        builder.Property(s => s.Description)
            .HasMaxLength(500);

        builder.Property(s => s.DescriptionAr)
            .HasMaxLength(500);

        builder.Ignore(s => s.NameEn);

        builder.HasIndex(s => s.NameAr);

        builder.Property(s => s.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(s => s.IsDefault)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.Created_Utc)
            .IsRequired();

        builder.Property(s => s.Created_By)
            .HasMaxLength(450);

        builder.Property(s => s.Updated_By)
            .HasMaxLength(450);

        builder.HasIndex(s => s.Name);
        builder.HasIndex(s => s.IsActive);
        builder.HasIndex(s => s.IsDefault);

        builder.HasMany(s => s.Days)
            .WithOne(d => d.Schedule)
            .HasForeignKey(d => d.WorkScheduleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.EmployeeAssignments)
            .WithOne(a => a.Schedule)
            .HasForeignKey(a => a.WorkScheduleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
