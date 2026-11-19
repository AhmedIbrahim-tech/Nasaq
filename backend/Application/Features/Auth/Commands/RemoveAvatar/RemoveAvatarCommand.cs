using Application.Abstractions;
using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.RemoveAvatar;

public sealed record RemoveAvatarCommand(string? UserId) : IRequest<GenericBaseResponse<bool>>;
