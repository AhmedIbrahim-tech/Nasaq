using Application.Features.Shifts.Commands.CreateShift;
using Application.Features.Shifts.Commands.DeleteShift;
using Application.Features.Shifts.Commands.ToggleShiftStatus;
using Application.Features.Shifts.Commands.UpdateShift;
using Application.Features.Shifts.Queries.GetShiftById;
using Application.Features.Shifts.Queries.GetShifts;
using Application.Features.Shifts.Queries.GetShiftsSummary;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class ShiftsController : ApiControllerBase
{
    [HttpGet(Router.Shifts.List)]
    [Authorize(Policy = PolicyNames.ScheduleView)]
    public async Task<IActionResult> GetShifts(
        [FromQuery] GetShiftsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpGet(Router.Shifts.Summary)]
    [Authorize(Policy = PolicyNames.ScheduleView)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetShiftsSummaryQuery(), cancellationToken));

    [HttpGet(Router.Shifts.GetById)]
    [Authorize(Policy = PolicyNames.ScheduleView)]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetShiftByIdQuery(id), cancellationToken));

    [HttpPost(Router.Shifts.Create)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> Create(
        [FromBody] CreateShiftCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPut(Router.Shifts.Update)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateShiftCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command with { Id = id }, cancellationToken));

    [HttpPatch(Router.Shifts.ToggleStatus)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> ToggleStatus(
        [FromRoute] Guid id,
        [FromBody] ToggleShiftStatusCommand? command = null,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send((command ?? new ToggleShiftStatusCommand(id)) with { Id = id }, cancellationToken));

    [HttpDelete(Router.Shifts.Delete)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> Delete(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new DeleteShiftCommand(id), cancellationToken));
}
