using Application.Abstractions;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Notifications.Queries.GetNotificationsPage;

public sealed record GetNotificationsPageQuery(
    string? UserId,
    int Page = 1,
    int PageSize = 10,
    bool Unread = false,
    NotificationCategory? Category = null,
    string? Search = null) : IRequest<GenericBaseResponse<object>>;
