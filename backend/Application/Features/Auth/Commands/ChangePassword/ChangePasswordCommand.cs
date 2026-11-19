using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.ChangePassword;

public sealed record ChangePasswordCommand(string? UserId, ChangePasswordRequest Request) : IRequest<GenericBaseResponse<bool>>;
