namespace Application.Features.Files.Queries.DownloadFile;

public sealed record DownloadFileQuery(Guid FileId)
    : IRequest<GenericBaseResponse<FileDownloadResult>>;
