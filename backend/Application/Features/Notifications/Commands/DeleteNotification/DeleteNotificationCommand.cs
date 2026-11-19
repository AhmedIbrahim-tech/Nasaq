using System;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Commands.DeleteNotification;

public sealed record DeleteNotificationCommand(string? UserId, Guid Id) : IRequest<GenericBaseResponse<object?>>;
