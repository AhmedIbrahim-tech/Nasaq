using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.UpdateProfile;

public sealed record UpdateProfileCommand(string? UserId, UpdateProfileRequest Request) : IRequest<GenericBaseResponse<CurrentUserResponse>>;
