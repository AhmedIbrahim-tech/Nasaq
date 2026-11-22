using Application.Features.Auth.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Queries.GetPendingForgotPasswordRequests;

public record GetPendingForgotPasswordRequestsQuery : IRequest<GenericBaseResponse<List<ForgotPasswordRequestDto>>>;
