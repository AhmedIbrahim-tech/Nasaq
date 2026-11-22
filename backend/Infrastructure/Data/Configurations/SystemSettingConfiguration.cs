using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
{
    public void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        builder.ToTable("SystemSettings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Key)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Value)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.Description)
            .HasMaxLength(500);

        builder.Property(s => s.Created_Utc)
            .IsRequired();

        builder.Property(s => s.Created_By)
            .HasMaxLength(450);

        builder.Property(s => s.Updated_By)
            .HasMaxLength(450);

        builder.HasIndex(s => s.Key)
            .IsUnique();
    }
}
