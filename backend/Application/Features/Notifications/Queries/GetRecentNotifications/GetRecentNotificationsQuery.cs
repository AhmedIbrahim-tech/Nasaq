using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Queries.GetRecentNotifications;

public sealed record GetRecentNotificationsQuery(string? UserId, int Take = 5) : IRequest<GenericBaseResponse<object>>;
