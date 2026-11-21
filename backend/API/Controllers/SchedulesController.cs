using Application.Features.Schedules.Commands.AssignEmployeeSchedule;
using Application.Features.Schedules.Commands.CreateSchedule;
using Application.Features.Schedules.Commands.DeleteEmployeeScheduleAssignment;
using Application.Features.Schedules.Commands.DeleteSchedule;
using Application.Features.Schedules.Commands.ToggleScheduleStatus;
using Application.Features.Schedules.Commands.UpdateSchedule;
using Application.Features.Schedules.Queries.GetEmployeeScheduleAssignments;
using Application.Features.Schedules.Queries.GetScheduleById;
using Application.Features.Schedules.Queries.GetSchedules;
using Application.Features.Schedules.Queries.GetSchedulesSummary;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class SchedulesController : ApiControllerBase
{
    [HttpGet(Router.Schedules.List)]
    [Authorize(Policy = PolicyNames.ScheduleView)]
    public async Task<IActionResult> GetSchedules(
        [FromQuery] GetSchedulesQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpGet(Router.Schedules.Summary)]
    [Authorize(Policy = PolicyNames.ScheduleView)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetSchedulesSummaryQuery(), cancellationToken));

    [HttpGet(Router.Schedules.GetById)]
    [Authorize(Policy = PolicyNames.ScheduleView)]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetScheduleByIdQuery(id), cancellationToken));

    [HttpPost(Router.Schedules.Create)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> Create(
        [FromBody] CreateScheduleCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPut(Router.Schedules.Update)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateScheduleCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command with { Id = id }, cancellationToken));

    [HttpPatch(Router.Schedules.ToggleStatus)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> ToggleStatus(
        [FromRoute] Guid id,
        [FromBody] ToggleScheduleStatusCommand? command = null,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send((command ?? new ToggleScheduleStatusCommand(id)) with { Id = id }, cancellationToken));

    [HttpDelete(Router.Schedules.Delete)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> Delete(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new DeleteScheduleCommand(id), cancellationToken));

    // --- Employee Assignments ---

    [HttpGet(Router.Schedules.Assignments)]
    [Authorize(Policy = PolicyNames.ScheduleView)]
    public async Task<IActionResult> GetAssignments(
        [FromQuery] GetEmployeeScheduleAssignmentsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpPost(Router.Schedules.Assignments)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> Assign(
        [FromBody] AssignEmployeeScheduleCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpDelete(Router.Schedules.AssignmentById)]
    [Authorize(Policy = PolicyNames.ScheduleManagement)]
    public async Task<IActionResult> DeleteAssignment(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new DeleteEmployeeScheduleAssignmentCommand(id), cancellationToken));
}
