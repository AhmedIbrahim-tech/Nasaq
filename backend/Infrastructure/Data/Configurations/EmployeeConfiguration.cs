namespace Infrastructure.Data.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.EmployeeCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(e => e.PhoneNumber)
            .HasMaxLength(50);

        builder.Property(e => e.Department)
            .HasMaxLength(100);

        builder.Property(e => e.JobTitle)
            .HasMaxLength(100);

        builder.Property(e => e.HireDate)
            .IsRequired();

        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.Created_Utc)
            .IsRequired();

        builder.Property(e => e.Created_By)
            .HasMaxLength(450);

        builder.Property(e => e.Updated_By)
            .HasMaxLength(450);

        builder.HasIndex(e => e.EmployeeCode)
            .IsUnique();

        builder.HasIndex(e => e.Email)
            .IsUnique();

        builder.HasIndex(e => e.UserId)
            .IsUnique()
            .HasFilter("[UserId] IS NOT NULL");

        builder.HasIndex(e => e.Department);
        builder.HasIndex(e => e.IsActive);
        builder.HasIndex(e => e.SupervisorId);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Restrict prevents SQL Server cascade path cycle
        builder.HasOne(e => e.Supervisor)
            .WithMany(s => s.SupervisedEmployees)
            .HasForeignKey(e => e.SupervisorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(e => e.ProfilePhoto)
            .IsRequired(false);

        builder.HasIndex(e => e.ProfilePhoto);

        builder.HasOne<StoredFile>()
            .WithMany()
            .HasForeignKey(e => e.ProfilePhoto)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
