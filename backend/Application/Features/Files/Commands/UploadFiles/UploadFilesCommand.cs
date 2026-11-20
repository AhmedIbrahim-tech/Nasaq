namespace Application.Features.Files.Commands.UploadFiles;

public sealed record UploadFilesCommand(
    FileCategory Category = default,
    Guid OwnerId = default,
    IReadOnlyList<IFormFile>? Files = null)
    : IRequest<GenericBaseResponse<IReadOnlyList<StoredFileDto>>>;
