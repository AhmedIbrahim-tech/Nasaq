using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Queries.GetUnreadNotificationCount;

public sealed class GetUnreadNotificationCountHandler(INotificationService notifications)
    : IRequestHandler<GetUnreadNotificationCountQuery, GenericBaseResponse<int>>
{
    public Task<GenericBaseResponse<int>> Handle(
        GetUnreadNotificationCountQuery request,
        CancellationToken cancellationToken) =>
        notifications.GetUnreadCountResponseAsync(request.UserId, cancellationToken);
}
