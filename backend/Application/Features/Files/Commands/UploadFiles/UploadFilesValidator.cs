namespace Application.Features.Files.Commands.UploadFiles;

public sealed class UploadFilesValidator : AbstractValidator<UploadFilesCommand>
{
    public UploadFilesValidator(IOptions<StorageOptions> options)
    {
        var storageOptions = options.Value;

        RuleFor(x => x.OwnerId)
            .NotEmpty()
            .WithMessage("Owner ID is required.");

        RuleFor(x => x.Category)
            .IsInEnum()
            .WithMessage("A valid file category must be specified.");

        RuleFor(x => x.Files)
            .NotEmpty()
            .WithMessage("At least one file must be provided for upload.")
            .Must(files => files.Count <= storageOptions.MaxFilesPerUpload)
            .WithMessage($"Cannot upload more than {storageOptions.MaxFilesPerUpload} files at once.");
    }
}
