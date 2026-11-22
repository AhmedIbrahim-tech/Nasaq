using Application.Features.Auth.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.SubmitForgotPasswordRequest;

public record SubmitForgotPasswordRequestCommand(string Identifier) : IRequest<GenericBaseResponse<SubmitForgotPasswordResponse>>;
