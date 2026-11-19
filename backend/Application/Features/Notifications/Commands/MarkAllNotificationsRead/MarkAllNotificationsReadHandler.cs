using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Commands.MarkAllNotificationsRead;

public sealed class MarkAllNotificationsReadHandler(INotificationService notifications)
    : IRequestHandler<MarkAllNotificationsReadCommand, GenericBaseResponse<object?>>
{
    public Task<GenericBaseResponse<object?>> Handle(
        MarkAllNotificationsReadCommand command,
        CancellationToken cancellationToken) =>
        notifications.MarkAllReadResponseAsync(command.UserId, cancellationToken);
}
