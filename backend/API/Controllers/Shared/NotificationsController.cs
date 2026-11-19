using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using API.Controllers.Base;
using API.Routing;
using Application.Features.Notifications.Commands.DeleteNotification;
using Application.Features.Notifications.Commands.MarkAllNotificationsRead;
using Application.Features.Notifications.Commands.MarkNotificationRead;
using Application.Features.Notifications.Queries.GetNotificationById;
using Application.Features.Notifications.Queries.GetNotificationsPage;
using Application.Features.Notifications.Queries.GetRecentNotifications;
using Application.Features.Notifications.Queries.GetUnreadNotificationCount;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class NotificationsController : ApiControllerBase
{
    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [HttpGet(Router.Notifications.Prefix)]
    public async Task<IActionResult> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool unread = false,
        [FromQuery] NotificationCategory? category = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(
            new GetNotificationsPageQuery(CurrentUserId, page, pageSize, unread, category, search),
            cancellationToken));

    [HttpGet(Router.Notifications.UnreadCount)]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(
            new GetUnreadNotificationCountQuery(CurrentUserId),
            cancellationToken));

    [HttpGet(Router.Notifications.Recent)]
    public async Task<IActionResult> GetRecent(
        [FromQuery] int take = 5,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(
            new GetRecentNotificationsQuery(CurrentUserId, take),
            cancellationToken));

    [HttpGet(Router.Notifications.GetById)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(
            new GetNotificationByIdQuery(CurrentUserId, id),
            cancellationToken));

    [HttpPost(Router.Notifications.MarkRead)]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(
            new MarkNotificationReadCommand(CurrentUserId, id),
            cancellationToken));

    [HttpPost(Router.Notifications.ReadAll)]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(
            new MarkAllNotificationsReadCommand(CurrentUserId),
            cancellationToken));

    [HttpDelete(Router.Notifications.GetById)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(
            new DeleteNotificationCommand(CurrentUserId, id),
            cancellationToken));
}
