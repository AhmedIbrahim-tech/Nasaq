using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.FirstLoginChangePassword;

public sealed record FirstLoginChangePasswordCommand(FirstLoginChangePasswordRequest Request) : IRequest<GenericBaseResponse<AuthResponse>>;
