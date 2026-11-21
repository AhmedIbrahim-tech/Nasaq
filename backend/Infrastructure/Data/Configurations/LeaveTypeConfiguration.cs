using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class LeaveTypeConfiguration : IEntityTypeConfiguration<LeaveType>
{
    public void Configure(EntityTypeBuilder<LeaveType> builder)
    {
        builder.ToTable("LeaveTypes");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(t => t.NameAr)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Description)
            .HasMaxLength(500);

        builder.Property(t => t.DescriptionAr)
            .HasMaxLength(500);

        builder.Ignore(t => t.NameEn);

        builder.Property(t => t.IsPaid)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(t => t.RequiresAttachment)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(t => t.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(t => t.Created_Utc)
            .IsRequired();

        builder.Property(t => t.Created_By)
            .HasMaxLength(450);

        builder.Property(t => t.Updated_By)
            .HasMaxLength(450);

        builder.HasIndex(t => t.Code)
            .IsUnique();

        builder.HasIndex(t => t.IsActive);
    }
}
