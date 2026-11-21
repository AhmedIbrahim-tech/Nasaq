using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Commands.CancelLeaveRequest;

public record CancelLeaveRequestCommand(Guid Id, string? Reason = null) : IRequest<GenericBaseResponse<LeaveRequestDto>>;
