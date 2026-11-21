namespace Infrastructure.Data.Configurations;

public class WorkShiftConfiguration : IEntityTypeConfiguration<WorkShift>
{
    public void Configure(EntityTypeBuilder<WorkShift> builder)
    {
        builder.ToTable("WorkShifts");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(s => s.NameAr)
            .HasMaxLength(150);

        builder.Ignore(s => s.NameEn);

        builder.HasIndex(s => s.NameAr);

        builder.Property(s => s.StartTime)
            .IsRequired();

        builder.Property(s => s.EndTime)
            .IsRequired();

        builder.Property(s => s.IsOvernight)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.Notes)
            .HasMaxLength(500);

        builder.Property(s => s.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(s => s.Created_Utc)
            .IsRequired();

        builder.Property(s => s.Created_By)
            .HasMaxLength(450);

        builder.Property(s => s.Updated_By)
            .HasMaxLength(450);

        builder.HasIndex(s => s.Name);
        builder.HasIndex(s => s.IsActive);
    }
}
