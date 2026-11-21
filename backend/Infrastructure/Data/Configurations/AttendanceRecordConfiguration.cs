namespace Infrastructure.Data.Configurations;

public class AttendanceRecordConfiguration : IEntityTypeConfiguration<AttendanceRecord>
{
    public void Configure(EntityTypeBuilder<AttendanceRecord> builder)
    {
        builder.ToTable("AttendanceRecords");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Date)
            .IsRequired();

        builder.Property(a => a.CheckInTimeUtc)
            .IsRequired();

        builder.Property(a => a.CheckInFailureReason)
            .HasMaxLength(500);

        builder.Property(a => a.CheckOutFailureReason)
            .HasMaxLength(500);

        builder.Property(a => a.CheckInDeviceInfo)
            .HasMaxLength(250);

        builder.Property(a => a.CheckOutDeviceInfo)
            .HasMaxLength(250);

        builder.Property(a => a.Notes)
            .HasMaxLength(1000);

        builder.Property(a => a.ReviewNotes)
            .HasMaxLength(1000);

        builder.Property(a => a.ReviewedBy)
            .HasMaxLength(450);

        builder.Property(a => a.Created_Utc)
            .IsRequired();

        builder.Property(a => a.Created_By)
            .HasMaxLength(450);

        builder.Property(a => a.Updated_By)
            .HasMaxLength(450);

        // Foreign keys with Restrict to protect historical records
        builder.HasOne(a => a.Employee)
            .WithMany()
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.WorkLocation)
            .WithMany()
            .HasForeignKey(a => a.WorkLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.WorkShift)
            .WithMany()
            .HasForeignKey(a => a.WorkShiftId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performance and reporting queries
        builder.HasIndex(a => a.EmployeeId);
        builder.HasIndex(a => a.Date);
        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.CheckInTimeUtc);
        builder.HasIndex(a => a.CheckOutTimeUtc);
        builder.HasIndex(a => new { a.EmployeeId, a.CheckOutTimeUtc });
    }
}
