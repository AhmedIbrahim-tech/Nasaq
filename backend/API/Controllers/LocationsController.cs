using Application.Features.Locations.Commands.BulkDeleteLocations;
using Application.Features.Locations.Commands.CreateLocation;
using Application.Features.Locations.Commands.DeleteLocation;
using Application.Features.Locations.Commands.ToggleLocationStatus;
using Application.Features.Locations.Commands.UpdateLocation;
using Application.Features.Locations.Queries.GetLocationById;
using Application.Features.Locations.Queries.GetLocations;
using Application.Features.Locations.Queries.GetLocationsSummary;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class LocationsController : ApiControllerBase
{
    [HttpGet(Router.Locations.List)]
    [Authorize(Policy = PolicyNames.LocationView)]
    public async Task<IActionResult> GetLocations(
        [FromQuery] GetLocationsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpGet(Router.Locations.Summary)]
    [Authorize(Policy = PolicyNames.LocationView)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetLocationsSummaryQuery(), cancellationToken));

    [HttpGet(Router.Locations.GetById)]
    [Authorize(Policy = PolicyNames.LocationView)]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetLocationByIdQuery(id), cancellationToken));

    [HttpPost(Router.Locations.Create)]
    [Authorize(Policy = PolicyNames.LocationManagement)]
    public async Task<IActionResult> Create(
        [FromBody] CreateLocationCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPut(Router.Locations.Update)]
    [Authorize(Policy = PolicyNames.LocationManagement)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateLocationCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command with { Id = id }, cancellationToken));

    [HttpPatch(Router.Locations.ToggleStatus)]
    [Authorize(Policy = PolicyNames.LocationManagement)]
    public async Task<IActionResult> ToggleStatus(
        [FromRoute] Guid id,
        [FromBody] ToggleLocationStatusCommand? command = null,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send((command ?? new ToggleLocationStatusCommand(id)) with { Id = id }, cancellationToken));

    [HttpDelete(Router.Locations.Delete)]
    [Authorize(Policy = PolicyNames.LocationManagement)]
    public async Task<IActionResult> Delete(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new DeleteLocationCommand(id), cancellationToken));

    [HttpPost(Router.Locations.BulkDelete)]
    [Authorize(Policy = PolicyNames.LocationManagement)]
    public async Task<IActionResult> BulkDelete(
        [FromBody] BulkDeleteLocationsCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));
}
