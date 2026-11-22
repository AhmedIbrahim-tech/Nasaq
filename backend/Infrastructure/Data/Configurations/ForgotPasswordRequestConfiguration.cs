using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class ForgotPasswordRequestConfiguration : IEntityTypeConfiguration<ForgotPasswordRequest>
{
    public void Configure(EntityTypeBuilder<ForgotPasswordRequest> builder)
    {
        builder.ToTable("ForgotPasswordRequests");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(f => f.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(f => f.EmployeeCode)
            .HasMaxLength(50);

        builder.Property(f => f.Status)
            .IsRequired();

        builder.Property(f => f.RequestedAtUtc)
            .IsRequired();

        builder.Property(f => f.ReviewedBy)
            .HasMaxLength(450);

        builder.Property(f => f.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(f => f.Created_Utc)
            .IsRequired();

        builder.Property(f => f.Created_By)
            .HasMaxLength(450);

        builder.Property(f => f.Updated_By)
            .HasMaxLength(450);

        builder.HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Employee)
            .WithMany()
            .HasForeignKey(f => f.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(f => new { f.UserId, f.Status });
        builder.HasIndex(f => f.Email);
    }
}
