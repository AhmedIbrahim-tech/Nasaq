using Application.Features.Files.Commands.UploadFiles;
using Application.Features.Files.Queries.DownloadFile;
using Application.Features.Files.Queries.GetFileMetadata;
using Application.Features.Files.Queries.GetFilesByOwner;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class FilesController : ApiControllerBase
{
    [HttpPost(Router.Files.Upload)]
    [Consumes(MultipartFormData)]
    public async Task<IActionResult> Upload(
        [FromForm] UploadFilesCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpGet(Router.Files.List)]
    public async Task<IActionResult> GetFiles(
        [FromQuery] GetFilesByOwnerQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpGet(Router.Files.GetById)]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetFileMetadataQuery(id), cancellationToken));

    [HttpGet(Router.Files.Download)]
    public async Task<IActionResult> Download(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default)
    {
        var response = await _mediator.Send(new DownloadFileQuery(id), cancellationToken);

        if (!response.Succeeded || response.Data is null)
        {
            return ActionResult(response);
        }

        var file = response.Data;
        return File(file.Stream, file.ContentType, file.OriginalFileName);
    }
}
