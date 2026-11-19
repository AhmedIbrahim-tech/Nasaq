using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Commands.DeleteNotification;

public sealed class DeleteNotificationHandler(INotificationService notifications)
    : IRequestHandler<DeleteNotificationCommand, GenericBaseResponse<object?>>
{
    public Task<GenericBaseResponse<object?>> Handle(
        DeleteNotificationCommand command,
        CancellationToken cancellationToken) =>
        notifications.DeleteResponseAsync(command.UserId, command.Id, cancellationToken);
}
