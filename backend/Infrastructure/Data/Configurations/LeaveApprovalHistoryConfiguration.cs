using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class LeaveApprovalHistoryConfiguration : IEntityTypeConfiguration<LeaveApprovalHistory>
{
    public void Configure(EntityTypeBuilder<LeaveApprovalHistory> builder)
    {
        builder.ToTable("LeaveApprovalHistories");

        builder.HasKey(h => h.Id);

        builder.Property(h => h.ActorId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(h => h.ActorName)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(h => h.Action)
            .IsRequired();

        builder.Property(h => h.Comments)
            .HasMaxLength(1000);

        builder.Property(h => h.ActionDateUtc)
            .IsRequired();

        builder.Property(h => h.Created_Utc)
            .IsRequired();

        builder.Property(h => h.Created_By)
            .HasMaxLength(450);

        builder.Property(h => h.Updated_By)
            .HasMaxLength(450);

        builder.HasOne(h => h.LeaveRequest)
            .WithMany(r => r.ApprovalHistory)
            .HasForeignKey(h => h.LeaveRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(h => h.LeaveRequestId);
        builder.HasIndex(h => h.ActionDateUtc);
    }
}
