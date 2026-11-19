using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Commands.MarkAllNotificationsRead;

public sealed record MarkAllNotificationsReadCommand(string? UserId) : IRequest<GenericBaseResponse<object?>>;
