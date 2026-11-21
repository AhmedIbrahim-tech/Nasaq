namespace Infrastructure.Data.Configurations;

public class PointTransactionConfiguration : IEntityTypeConfiguration<PointTransaction>
{
    public void Configure(EntityTypeBuilder<PointTransaction> builder)
    {
        builder.ToTable("PointTransactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Category)
            .IsRequired();

        builder.Property(t => t.EventType)
            .IsRequired();

        builder.Property(t => t.Points)
            .IsRequired();

        builder.Property(t => t.Status)
            .IsRequired();

        builder.Property(t => t.Date)
            .IsRequired();

        builder.Property(t => t.TimestampUtc)
            .IsRequired();

        builder.Property(t => t.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.SourceEventType)
            .HasMaxLength(100);

        builder.Property(t => t.Created_Utc)
            .IsRequired();

        builder.Property(t => t.Created_By)
            .HasMaxLength(450);

        builder.Property(t => t.Updated_By)
            .HasMaxLength(450);

        builder.HasOne(t => t.Employee)
            .WithMany()
            .HasForeignKey(t => t.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Rule)
            .WithMany(r => r.Transactions)
            .HasForeignKey(t => t.RuleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.RelatedTransaction)
            .WithMany()
            .HasForeignKey(t => t.RelatedTransactionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => t.EmployeeId);
        builder.HasIndex(t => t.RuleId);
        builder.HasIndex(t => t.Category);
        builder.HasIndex(t => t.EventType);
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.Date);
        builder.HasIndex(t => t.TimestampUtc);
        builder.HasIndex(t => new { t.EmployeeId, t.SourceEventId, t.RuleId });
    }
}
