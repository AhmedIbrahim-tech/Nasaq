using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Queries.GetNotificationsPage;

public sealed class GetNotificationsPageHandler(INotificationService notifications)
    : IRequestHandler<GetNotificationsPageQuery, GenericBaseResponse<object>>
{
    public Task<GenericBaseResponse<object>> Handle(
        GetNotificationsPageQuery request,
        CancellationToken cancellationToken) =>
        notifications.GetPageResponseAsync(
            request.UserId,
            request.Page,
            request.PageSize,
            request.Unread,
            request.Category,
            request.Search,
            cancellationToken);
}
