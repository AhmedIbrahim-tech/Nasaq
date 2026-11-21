namespace Infrastructure.Data.Configurations;

public class PointRuleConfiguration : IEntityTypeConfiguration<PointRule>
{
    public void Configure(EntityTypeBuilder<PointRule> builder)
    {
        builder.ToTable("PointRules");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(r => r.NameAr)
            .HasMaxLength(150);

        builder.Property(r => r.Description)
            .HasMaxLength(500);

        builder.Property(r => r.DescriptionAr)
            .HasMaxLength(500);

        builder.Ignore(r => r.NameEn);

        builder.HasIndex(r => r.NameAr);

        builder.Property(r => r.Category)
            .IsRequired();

        builder.Property(r => r.EventType)
            .IsRequired();

        builder.Property(r => r.Points)
            .IsRequired();

        builder.Property(r => r.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(r => r.EffectiveFrom)
            .IsRequired();

        builder.Property(r => r.Created_Utc)
            .IsRequired();

        builder.Property(r => r.Created_By)
            .HasMaxLength(450);

        builder.Property(r => r.Updated_By)
            .HasMaxLength(450);

        builder.HasIndex(r => r.Name);
        builder.HasIndex(r => r.Category);
        builder.HasIndex(r => r.EventType);
        builder.HasIndex(r => r.IsActive);
        builder.HasIndex(r => r.EffectiveFrom);
    }
}
