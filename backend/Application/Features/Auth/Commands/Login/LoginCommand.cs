using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.Login;

public sealed record LoginCommand(LoginRequest Request) : IRequest<GenericBaseResponse<AuthResponse>>;
