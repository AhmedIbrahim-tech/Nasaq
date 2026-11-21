using API.Controllers.Base;
using API.Routing;
using Application.Features.Attendance.Commands.CheckIn;
using Application.Features.Attendance.Commands.CheckOut;
using Application.Features.Attendance.Queries.GetAttendanceRecordById;
using Application.Features.Attendance.Queries.GetAttendanceRecords;
using Application.Features.Attendance.Queries.GetCurrentAttendanceStatus;
using Application.Features.Attendance.Queries.GetMyAttendanceHistory;
using Domain.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class AttendanceController : ApiControllerBase
{
    [HttpPost(Router.Attendance.CheckIn)]
    public async Task<IActionResult> CheckIn(
        [FromBody] CheckInCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPost(Router.Attendance.CheckOut)]
    public async Task<IActionResult> CheckOut(
        [FromBody] CheckOutCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpGet(Router.Attendance.Status)]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetCurrentAttendanceStatusQuery(), cancellationToken));

    [HttpGet(Router.Attendance.MyHistory)]
    public async Task<IActionResult> GetMyHistory(
        [FromQuery] GetMyAttendanceHistoryQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpGet(Router.Attendance.List)]
    [Authorize(Policy = PolicyNames.AttendanceView)]
    public async Task<IActionResult> GetRecords(
        [FromQuery] GetAttendanceRecordsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpGet(Router.Attendance.GetById)]
    [Authorize(Policy = PolicyNames.AttendanceView)]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetAttendanceRecordByIdQuery(id), cancellationToken));
}
