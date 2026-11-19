using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Queries.GetNotificationById;

public sealed class GetNotificationByIdHandler(INotificationService notifications)
    : IRequestHandler<GetNotificationByIdQuery, GenericBaseResponse<object>>
{
    public Task<GenericBaseResponse<object>> Handle(
        GetNotificationByIdQuery request,
        CancellationToken cancellationToken) =>
        notifications.GetSingleResponseAsync(request.UserId, request.Id, cancellationToken);
}
