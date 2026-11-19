using System;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Queries.GetNotificationById;

public sealed record GetNotificationByIdQuery(string? UserId, Guid Id) : IRequest<GenericBaseResponse<object>>;
