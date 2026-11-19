using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Queries.GetUnreadNotificationCount;

public sealed record GetUnreadNotificationCountQuery(string? UserId) : IRequest<GenericBaseResponse<int>>;
