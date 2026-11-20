namespace Infrastructure.Data.Configurations;

public class StoredFileConfiguration : IEntityTypeConfiguration<StoredFile>
{
    public void Configure(EntityTypeBuilder<StoredFile> builder)
    {
        builder.ToTable("StoredFiles");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Category)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(f => f.OwnerId)
            .IsRequired();

        builder.Property(f => f.OriginalFileName)
            .HasMaxLength(260)
            .IsRequired();

        builder.Property(f => f.StoredFileName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(f => f.RelativePath)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(f => f.ContentType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(f => f.FileSize)
            .IsRequired();

        builder.Property(f => f.UploadedAtUtc)
            .IsRequired();

        builder.Property(f => f.UploadedBy)
            .HasMaxLength(450);

        builder.Property(f => f.Created_Utc)
            .IsRequired();

        builder.Property(f => f.Created_By)
            .HasMaxLength(450);

        builder.Property(f => f.Updated_By)
            .HasMaxLength(450);

        builder.HasIndex(f => new { f.Category, f.OwnerId })
            .HasDatabaseName("IX_StoredFiles_Category_OwnerId");
    }
}
