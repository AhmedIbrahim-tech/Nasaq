using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.ToTable("LeaveRequests");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.StartDate)
            .IsRequired();

        builder.Property(r => r.EndDate)
            .IsRequired();

        builder.Property(r => r.DaysCount)
            .IsRequired();

        builder.Property(r => r.Reason)
            .HasMaxLength(1000);

        builder.Property(r => r.Status)
            .IsRequired();

        builder.Property(r => r.SubmittedAtUtc)
            .IsRequired();

        builder.Property(r => r.ReviewedBy)
            .HasMaxLength(256);

        builder.Property(r => r.ReviewNotes)
            .HasMaxLength(1000);

        builder.Property(r => r.Created_Utc)
            .IsRequired();

        builder.Property(r => r.Created_By)
            .HasMaxLength(450);

        builder.Property(r => r.Updated_By)
            .HasMaxLength(450);

        // Relationships
        builder.HasOne(r => r.Employee)
            .WithMany(e => e.LeaveRequests)
            .HasForeignKey(r => r.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.LeaveType)
            .WithMany(t => t.LeaveRequests)
            .HasForeignKey(r => r.LeaveTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performant range queries and overlap checks
        builder.HasIndex(r => r.EmployeeId);
        builder.HasIndex(r => r.LeaveTypeId);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => new { r.EmployeeId, r.StartDate, r.EndDate });
        builder.HasIndex(r => new { r.EmployeeId, r.Status });
    }
}
