using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class EmployeeLocationRequestConfiguration : IEntityTypeConfiguration<EmployeeLocationRequest>
{
    public void Configure(EntityTypeBuilder<EmployeeLocationRequest> builder)
    {
        builder.ToTable("EmployeeLocationRequests");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.RequestType)
            .IsRequired();

        builder.Property(e => e.Latitude)
            .IsRequired();

        builder.Property(e => e.Longitude)
            .IsRequired();

        builder.Property(e => e.AccuracyMeters);

        builder.Property(e => e.AddressDescription)
            .HasMaxLength(500);

        builder.Property(e => e.Status)
            .IsRequired();

        builder.Property(e => e.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(e => e.ReviewedBy)
            .HasMaxLength(450);

        builder.Property(e => e.AdminNotes)
            .HasMaxLength(1000);

        builder.Property(e => e.Created_Utc)
            .IsRequired();

        builder.Property(e => e.Created_By)
            .HasMaxLength(450);

        builder.Property(e => e.Updated_By)
            .HasMaxLength(450);

        builder.HasOne(e => e.Employee)
            .WithMany(emp => emp.LocationRequests)
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.EmployeeId, e.Status });
    }
}
