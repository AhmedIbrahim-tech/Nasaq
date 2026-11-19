using System;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Commands.MarkNotificationRead;

public sealed record MarkNotificationReadCommand(string? UserId, Guid Id) : IRequest<GenericBaseResponse<object?>>;
