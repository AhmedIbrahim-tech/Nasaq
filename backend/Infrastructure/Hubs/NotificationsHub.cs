using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Hubs;

[Authorize]
public sealed class NotificationsHub : Hub
{
    private readonly ILogger<NotificationsHub> _logger;
    private readonly HashSet<string> _allowedOrigins;

    public NotificationsHub(ILogger<NotificationsHub> logger, IConfiguration configuration)
    {
        _logger = logger;
        var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        _allowedOrigins = origins
            .Where(o => !string.IsNullOrWhiteSpace(o))
            .Select(o => o.Trim().TrimEnd('/'))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    public override Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        if (httpContext is not null && httpContext.Request.Headers.TryGetValue("Origin", out var originValues))
        {
            var origin = originValues.ToString().Trim().TrimEnd('/');
            if (!string.IsNullOrEmpty(origin) && _allowedOrigins.Count > 0 && !_allowedOrigins.Contains(origin))
            {
                _logger.LogWarning("Rejected unauthorized WebSocket connection from origin: {Origin} for user: {UserId}", origin, Context.UserIdentifier);
                Context.Abort();
                return Task.CompletedTask;
            }
        }

        _logger.LogInformation("SignalR connection established for user: {UserId}, ConnectionId: {ConnectionId}", Context.UserIdentifier, Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("SignalR disconnected for user: {UserId}, ConnectionId: {ConnectionId}", Context.UserIdentifier, Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }
}
