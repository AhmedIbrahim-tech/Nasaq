using API.Controllers.Base;
using API.Routing;
using Application.Features.Points.Commands.CreatePointRule;
using Application.Features.Points.Commands.EvaluateAttendanceRecord;
using Application.Features.Points.Commands.ReversePointTransaction;
using Application.Features.Points.Commands.TogglePointRuleStatus;
using Application.Features.Points.Commands.UpdatePointRule;
using Application.Features.Points.Queries.GetMyPointsSummary;
using Application.Features.Points.Queries.GetMyPointTransactions;
using Application.Features.Points.Queries.GetPointRuleById;
using Application.Features.Points.Queries.GetPointRules;
using Application.Features.Points.Queries.GetPointTransactions;
using Domain.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class PointsController : ApiControllerBase
{
    // --- Employee My Points Endpoints ---
    [HttpGet(Router.Points.MySummary)]
    public async Task<IActionResult> GetMySummary(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetMyPointsSummaryQuery(), cancellationToken));

    [HttpGet(Router.Points.MyTransactions)]
    public async Task<IActionResult> GetMyTransactions(
        [FromQuery] GetMyPointTransactionsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    // --- Admin / Supervisor Ledger Endpoints ---
    [HttpGet(Router.Points.Transactions)]
    [Authorize(Policy = PolicyNames.PointsView)]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] GetPointTransactionsQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpPost(Router.Points.Reverse)]
    [Authorize(Policy = PolicyNames.PointsManagement)]
    public async Task<IActionResult> ReverseTransaction(
        [FromRoute] Guid id,
        [FromBody] ReversePointTransactionRequest request,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new ReversePointTransactionCommand(id, request.Reason), cancellationToken));

    // --- Evaluation Endpoint ---
    [HttpPost(Router.Points.Evaluate)]
    [Authorize(Policy = PolicyNames.PointsManagement)]
    public async Task<IActionResult> EvaluateAttendance(
        [FromBody] EvaluateAttendanceRecordCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    // --- Rules Management Endpoints ---
    [HttpGet(Router.Points.Rules)]
    [Authorize(Policy = PolicyNames.PointsView)]
    public async Task<IActionResult> GetRules(
        [FromQuery] GetPointRulesQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpGet(Router.Points.RuleById)]
    [Authorize(Policy = PolicyNames.PointsView)]
    public async Task<IActionResult> GetRuleById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetPointRuleByIdQuery(id), cancellationToken));

    [HttpPost(Router.Points.Rules)]
    [Authorize(Policy = PolicyNames.PointsManagement)]
    public async Task<IActionResult> CreateRule(
        [FromBody] CreatePointRuleCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPut(Router.Points.RuleById)]
    [Authorize(Policy = PolicyNames.PointsManagement)]
    public async Task<IActionResult> UpdateRule(
        [FromRoute] Guid id,
        [FromBody] UpdatePointRuleCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command with { Id = id }, cancellationToken));

    [HttpPatch(Router.Points.RuleToggleStatus)]
    [Authorize(Policy = PolicyNames.PointsManagement)]
    public async Task<IActionResult> ToggleRuleStatus(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new TogglePointRuleStatusCommand(id), cancellationToken));
}

public sealed record ReversePointTransactionRequest(string Reason);
