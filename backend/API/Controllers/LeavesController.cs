using API.Controllers.Base;
using API.Routing;
using Application.Features.Leaves.Commands.ApproveLeaveRequest;
using Application.Features.Leaves.Commands.CancelLeaveRequest;
using Application.Features.Leaves.Commands.CreateLeaveType;
using Application.Features.Leaves.Commands.RejectLeaveRequest;
using Application.Features.Leaves.Commands.SubmitLeaveRequest;
using Application.Features.Leaves.Commands.ToggleLeaveTypeStatus;
using Application.Features.Leaves.Commands.UpdateLeaveType;
using Application.Features.Leaves.Queries.GetLeaveRequestById;
using Application.Features.Leaves.Queries.GetLeaveRequests;
using Application.Features.Leaves.Queries.GetLeaveSummary;
using Application.Features.Leaves.Queries.GetLeaveTypeById;
using Application.Features.Leaves.Queries.GetLeaveTypes;
using Application.Features.Leaves.Queries.GetMyLeaveRequests;
using Domain.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class LeavesController : ApiControllerBase
{
    // --- Leave Types Endpoints ---
    [HttpGet(Router.Leaves.Types)]
    public async Task<IActionResult> GetTypes(
        [FromQuery] bool activeOnly = false,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetLeaveTypesQuery(activeOnly), cancellationToken));

    [HttpGet(Router.Leaves.TypeById)]
    public async Task<IActionResult> GetTypeById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetLeaveTypeByIdQuery(id), cancellationToken));

    [HttpPost(Router.Leaves.Types)]
    [Authorize(Policy = PolicyNames.RequireAdmin)]
    public async Task<IActionResult> CreateType(
        [FromBody] CreateLeaveTypeCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPut(Router.Leaves.TypeById)]
    [Authorize(Policy = PolicyNames.RequireAdmin)]
    public async Task<IActionResult> UpdateType(
        [FromRoute] Guid id,
        [FromBody] UpdateLeaveTypeCommand command,
        CancellationToken cancellationToken = default)
    {
        if (id != command.Id)
        {
            return BadRequest("Route ID and payload ID do not match.");
        }
        return ActionResult(await _mediator.Send(command, cancellationToken));
    }

    [HttpPatch(Router.Leaves.TypeToggleStatus)]
    [Authorize(Policy = PolicyNames.RequireAdmin)]
    public async Task<IActionResult> ToggleTypeStatus(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new ToggleLeaveTypeStatusCommand(id), cancellationToken));

    // --- Leave Requests Endpoints ---
    [HttpGet(Router.Leaves.MyRequests)]
    public async Task<IActionResult> GetMyRequests(
        [FromQuery] GetMyLeaveRequestsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpPost(Router.Leaves.Requests)]
    [Consumes(MultipartFormData)]
    public async Task<IActionResult> SubmitRequest(
        [FromForm] SubmitLeaveRequestCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpGet(Router.Leaves.RequestById)]
    public async Task<IActionResult> GetRequestById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetLeaveRequestByIdQuery(id), cancellationToken));

    [HttpPost(Router.Leaves.CancelRequest)]
    public async Task<IActionResult> CancelRequest(
        [FromRoute] Guid id,
        [FromBody] CancelLeaveRequestCommand command,
        CancellationToken cancellationToken = default)
    {
        if (id != command.Id)
        {
            return BadRequest("Route ID and payload ID do not match.");
        }
        return ActionResult(await _mediator.Send(command, cancellationToken));
    }

    // --- Approvals / Review Queue Endpoints ---
    [HttpGet(Router.Leaves.Approvals)]
    [Authorize(Policy = PolicyNames.LeaveManagement)]
    public async Task<IActionResult> GetApprovalsQueue(
        [FromQuery] GetLeaveRequestsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpPost(Router.Leaves.Approve)]
    [Authorize(Policy = PolicyNames.LeaveManagement)]
    public async Task<IActionResult> ApproveRequest(
        [FromRoute] Guid id,
        [FromBody] ApproveLeaveRequestCommand command,
        CancellationToken cancellationToken = default)
    {
        if (id != command.Id)
        {
            return BadRequest("Route ID and payload ID do not match.");
        }
        return ActionResult(await _mediator.Send(command, cancellationToken));
    }

    [HttpPost(Router.Leaves.Reject)]
    [Authorize(Policy = PolicyNames.LeaveManagement)]
    public async Task<IActionResult> RejectRequest(
        [FromRoute] Guid id,
        [FromBody] RejectLeaveRequestCommand command,
        CancellationToken cancellationToken = default)
    {
        if (id != command.Id)
        {
            return BadRequest("Route ID and payload ID do not match.");
        }
        return ActionResult(await _mediator.Send(command, cancellationToken));
    }

    // --- Summary Metrics ---
    [HttpGet(Router.Leaves.Summary)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetLeaveSummaryQuery(), cancellationToken));
}
