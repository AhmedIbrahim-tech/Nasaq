using API.Controllers.Base;
using API.Routing;
using Application.Features.AdminOperations.Commands.ApproveGpsException;
using Application.Features.AdminOperations.Commands.CorrectIncompleteAttendance;
using Application.Features.AdminOperations.Commands.ManualPointAdjustment;
using Application.Features.AdminOperations.Commands.RejectGpsException;
using Application.Features.AdminOperations.Queries.GetAdminOperationsSummary;
using Application.Features.AdminOperations.Queries.GetDailyAttendanceOperations;
using Application.Features.AdminOperations.Queries.GetGpsExceptions;
using Application.Features.AdminOperations.Queries.GetIncompleteAttendance;
using Domain.Authorization;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class AdminOperationsController : ApiControllerBase
{
    // --- Operational Summary ---
    [HttpGet(Router.AdminOperations.Summary)]
    [Authorize(Policy = PolicyNames.AttendanceView)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetAdminOperationsSummaryQuery(), cancellationToken));

    // --- Daily Attendance Operations ---
    [HttpGet(Router.AdminOperations.DailyAttendance)]
    [Authorize(Policy = PolicyNames.AttendanceView)]
    public async Task<IActionResult> GetDailyAttendance(
        [FromQuery] GetDailyAttendanceOperationsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    // --- GPS Exceptions Review Queue ---
    [HttpGet(Router.AdminOperations.GpsExceptions)]
    [Authorize(Policy = PolicyNames.AttendanceView)]
    public async Task<IActionResult> GetGpsExceptions(
        [FromQuery] GetGpsExceptionsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpPost(Router.AdminOperations.ApproveGps)]
    [Authorize(Policy = PolicyNames.AttendanceManagement)]
    public async Task<IActionResult> ApproveGpsException(
        [FromRoute] Guid id,
        [FromBody] ApproveGpsExceptionRequest request,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new ApproveGpsExceptionCommand(id, request.EventType ?? "CheckIn", request.Notes ?? request.ReviewNotes), cancellationToken));

    [HttpPost(Router.AdminOperations.RejectGps)]
    [Authorize(Policy = PolicyNames.AttendanceManagement)]
    public async Task<IActionResult> RejectGpsException(
        [FromRoute] Guid id,
        [FromBody] RejectGpsExceptionRequest request,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new RejectGpsExceptionCommand(id, request.EventType ?? "CheckIn", request.Reason), cancellationToken));

    // --- Incomplete Attendance Corrections ---
    [HttpGet(Router.AdminOperations.IncompleteAttendance)]
    [Authorize(Policy = PolicyNames.AttendanceView)]
    public async Task<IActionResult> GetIncompleteAttendance(
        [FromQuery] GetIncompleteAttendanceQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpPost(Router.AdminOperations.CorrectIncomplete)]
    [Authorize(Policy = PolicyNames.AttendanceManagement)]
    public async Task<IActionResult> CorrectIncomplete(
        [FromRoute] Guid id,
        [FromBody] CorrectIncompleteAttendanceRequest request,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new CorrectIncompleteAttendanceCommand(id, request.ManualCheckOutTimeUtc, request.Reason), cancellationToken));

    // --- Manual Point Adjustments ---
    [HttpPost(Router.AdminOperations.ManualPointAdjustment)]
    [Authorize(Policy = PolicyNames.PointsManagement)]
    public async Task<IActionResult> ManualPointAdjustment(
        [FromBody] ManualPointAdjustmentCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));
}

public sealed record ApproveGpsExceptionRequest(string? EventType = "CheckIn", string? Notes = null, string? ReviewNotes = null);
public sealed record RejectGpsExceptionRequest(string? EventType = "CheckIn", string Reason = "");
public sealed record CorrectIncompleteAttendanceRequest(DateTime ManualCheckOutTimeUtc, string Reason);
