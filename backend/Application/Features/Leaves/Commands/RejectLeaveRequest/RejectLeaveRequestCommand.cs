using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Commands.RejectLeaveRequest;

public record RejectLeaveRequestCommand(Guid Id, string Reason) : IRequest<GenericBaseResponse<LeaveRequestDto>>;
