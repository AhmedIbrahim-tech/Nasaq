namespace Infrastructure.Data.Configurations;

public class WorkLocationConfiguration : IEntityTypeConfiguration<WorkLocation>
{
    public void Configure(EntityTypeBuilder<WorkLocation> builder)
    {
        builder.ToTable("WorkLocations");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(w => w.NameAr)
            .HasMaxLength(150);

        builder.Property(w => w.Address)
            .HasMaxLength(250);

        builder.Property(w => w.AddressAr)
            .HasMaxLength(250);

        builder.Ignore(w => w.NameEn);

        builder.HasIndex(w => w.NameAr);

        builder.Property(w => w.Latitude)
            .IsRequired();

        builder.Property(w => w.Longitude)
            .IsRequired();

        builder.Property(w => w.RadiusMeters)
            .IsRequired()
            .HasDefaultValue(150.0);

        builder.Property(w => w.AccuracyThresholdMeters)
            .IsRequired()
            .HasDefaultValue(50.0);

        builder.Property(w => w.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(w => w.Created_Utc)
            .IsRequired();

        builder.Property(w => w.Created_By)
            .HasMaxLength(450);

        builder.Property(w => w.Updated_By)
            .HasMaxLength(450);

        builder.HasIndex(w => w.Name);
        builder.HasIndex(w => w.IsActive);
    }
}
