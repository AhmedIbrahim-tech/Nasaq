using Application.Abstractions;
using Domain.Common;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Features.Auth.Commands.Logout;

public sealed record LogoutCommand(LogoutRequest Request) : IRequest<GenericBaseResponse<object?>>;
