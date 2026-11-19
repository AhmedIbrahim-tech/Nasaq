using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Commands.MarkNotificationRead;

public sealed class MarkNotificationReadHandler(INotificationService notifications)
    : IRequestHandler<MarkNotificationReadCommand, GenericBaseResponse<object?>>
{
    public Task<GenericBaseResponse<object?>> Handle(
        MarkNotificationReadCommand command,
        CancellationToken cancellationToken) =>
        notifications.MarkReadResponseAsync(command.UserId, command.Id, cancellationToken);
}
