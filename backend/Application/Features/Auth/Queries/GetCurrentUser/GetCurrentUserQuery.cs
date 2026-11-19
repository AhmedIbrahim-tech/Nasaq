using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Queries.GetCurrentUser;

public sealed record GetCurrentUserQuery(string? UserId) : IRequest<GenericBaseResponse<CurrentUserResponse>>;
