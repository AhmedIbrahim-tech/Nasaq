using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Queries.GetRecentNotifications;

public sealed class GetRecentNotificationsHandler(INotificationService notifications)
    : IRequestHandler<GetRecentNotificationsQuery, GenericBaseResponse<object>>
{
    public Task<GenericBaseResponse<object>> Handle(
        GetRecentNotificationsQuery request,
        CancellationToken cancellationToken) =>
        notifications.GetRecentResponseAsync(request.UserId, request.Take, cancellationToken);
}
