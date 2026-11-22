using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class EmployeePersonalLocationConfiguration : IEntityTypeConfiguration<EmployeePersonalLocation>
{
    public void Configure(EntityTypeBuilder<EmployeePersonalLocation> builder)
    {
        builder.ToTable("EmployeePersonalLocations");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Latitude)
            .IsRequired();

        builder.Property(e => e.Longitude)
            .IsRequired();

        builder.Property(e => e.AccuracyMeters);

        builder.Property(e => e.AddressDescription)
            .HasMaxLength(500);

        builder.Property(e => e.IsApproved)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.Source)
            .HasMaxLength(100);

        builder.Property(e => e.ApprovedBy)
            .HasMaxLength(450);

        builder.Property(e => e.Created_Utc)
            .IsRequired();

        builder.Property(e => e.Created_By)
            .HasMaxLength(450);

        builder.Property(e => e.Updated_By)
            .HasMaxLength(450);

        builder.HasOne(e => e.Employee)
            .WithMany(emp => emp.PersonalLocations)
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.EmployeeId, e.IsActive });
    }
}
