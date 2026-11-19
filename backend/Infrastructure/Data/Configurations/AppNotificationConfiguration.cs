using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class AppNotificationConfiguration : IEntityTypeConfiguration<AppNotification>
{
    public void Configure(EntityTypeBuilder<AppNotification> builder)
    {
        builder.ToTable("AppNotifications");

        builder.HasKey(e => e.Notification_ID);

        builder.Property(e => e.User_ID)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Message)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(e => e.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(32);

        builder.Property(e => e.Action_Url)
            .HasMaxLength(512);

        builder.Property(e => e.Is_Read)
            .IsRequired();

        builder.Property(e => e.Created_Utc)
            .IsRequired();

        builder.HasIndex(e => new { e.User_ID, e.Is_Read });
        builder.HasIndex(e => new { e.User_ID, e.Created_Utc });

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.User_ID)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
