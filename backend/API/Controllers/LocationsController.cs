using Application.Features.Locations.Commands.BulkDeleteLocations;
using Application.Features.Locations.Commands.CreateLocation;
using Application.Features.Locations.Commands.DeleteLocation;
using Application.Features.Locations.Commands.ToggleLocationStatus;
using Application.Features.Locations.Commands.UpdateLocation;
using Application.Features.Locations.Queries.GetLocationById;
using Application.Features.Locations.Queries.GetLocations;
using Application.Features.Locations.Queries.GetLocationsSummary;
using Application.Features.EmployeeLocations.Commands.AdminChangeEmployeeLocation;
using Application.Features.EmployeeLocations.Commands.ApproveEmployeeLocation;
using Application.Features.EmployeeLocations.Commands.CancelLocationRequest;
using Application.Features.EmployeeLocations.Commands.RegisterEmployeeLocation;
using Application.Features.EmployeeLocations.Commands.RejectEmployeeLocation;
using Application.Features.EmployeeLocations.Commands.RequestEmployeeLocationChange;
using Application.Features.EmployeeLocations.Commands.ResetEmployeeLocation;
using Application.Features.EmployeeLocations.Commands.UpdateCompanyLocationCoordinates;
using Application.Features.EmployeeLocations.Commands.UpdateGlobalGeofenceRadius;
using Application.Features.EmployeeLocations.Queries.GetGlobalGeofenceRadius;
using Application.Features.EmployeeLocations.Queries.GetMyPersonalLocation;
using Application.Features.EmployeeLocations.Queries.GetPendingLocationRequests;

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

    // --- Global Geofence Radius ---
    [HttpGet(Router.Locations.GlobalRadius)]
    public async Task<IActionResult> GetGlobalRadius(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetGlobalGeofenceRadiusQuery(), cancellationToken));

    [HttpPut(Router.Locations.GlobalRadius)]
    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    public async Task<IActionResult> UpdateGlobalRadius(
        [FromBody] UpdateRadiusBody body,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new UpdateGlobalGeofenceRadiusCommand(body.RadiusMeters), cancellationToken));

    // --- Company Location Coordinates ---
    [HttpPut(Router.Locations.UpdateCoordinates)]
    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    public async Task<IActionResult> UpdateCoordinates(
        [FromRoute] Guid id,
        [FromBody] UpdateCoordinatesBody body,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new UpdateCompanyLocationCoordinatesCommand(id, body.Latitude, body.Longitude), cancellationToken));

    // --- Employee Personal Location (Self-Service) ---
    [HttpGet(Router.Locations.MyPersonalLocation)]
    public async Task<IActionResult> GetMyPersonalLocation(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetMyPersonalLocationQuery(), cancellationToken));

    [HttpPost(Router.Locations.RegisterPersonalLocation)]
    public async Task<IActionResult> RegisterPersonalLocation(
        [FromBody] RegisterEmployeeLocationCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPost(Router.Locations.RequestLocationChange)]
    public async Task<IActionResult> RequestLocationChange(
        [FromBody] RequestEmployeeLocationChangeCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPost(Router.Locations.CancelLocationRequest)]
    public async Task<IActionResult> CancelLocationRequest(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new CancelLocationRequestCommand(id), cancellationToken));

    // --- Administrative Location Review & Management ---
    [HttpGet(Router.Locations.PendingLocationRequests)]
    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    public async Task<IActionResult> GetPendingLocationRequests(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetPendingLocationRequestsQuery(), cancellationToken));

    [HttpPost(Router.Locations.ApproveLocationRequest)]
    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    public async Task<IActionResult> ApproveLocationRequest(
        [FromRoute] Guid id,
        [FromBody] ApproveLocationRequestBody? body = null,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new ApproveEmployeeLocationCommand(id, body?.AdminNotes), cancellationToken));

    [HttpPost(Router.Locations.RejectLocationRequest)]
    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    public async Task<IActionResult> RejectLocationRequest(
        [FromRoute] Guid id,
        [FromBody] RejectLocationRequestBody body,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new RejectEmployeeLocationCommand(id, body.RejectionReason), cancellationToken));

    [HttpPost(Router.Locations.AdminChangeEmployeeLocation)]
    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    public async Task<IActionResult> AdminChangeEmployeeLocation(
        [FromRoute] Guid employeeId,
        [FromBody] AdminChangeEmployeeLocationBody body,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new AdminChangeEmployeeLocationCommand(
            employeeId, body.Latitude, body.Longitude, body.AccuracyMeters, body.AddressDescription, body.AdminNotes), cancellationToken));

    [HttpPost(Router.Locations.ResetEmployeeLocation)]
    [Authorize(Roles = $"{RoleNames.SuperAdmin},{RoleNames.Admin}")]
    public async Task<IActionResult> ResetEmployeeLocation(
        [FromRoute] Guid employeeId,
        [FromBody] ResetEmployeeLocationBody? body = null,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new ResetEmployeeLocationCommand(employeeId, body?.Reason), cancellationToken));
}

public record UpdateRadiusBody(double RadiusMeters);
public record UpdateCoordinatesBody(double Latitude, double Longitude);
public record ApproveLocationRequestBody(string? AdminNotes);
public record RejectLocationRequestBody(string RejectionReason);
public record AdminChangeEmployeeLocationBody(double Latitude, double Longitude, double? AccuracyMeters, string? AddressDescription, string? AdminNotes);
public record ResetEmployeeLocationBody(string? Reason);
