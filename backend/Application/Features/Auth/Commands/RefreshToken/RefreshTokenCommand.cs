using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.RefreshToken;

public sealed record RefreshTokenCommand(RefreshTokenRequest Request) : IRequest<GenericBaseResponse<AuthResponse>>;
