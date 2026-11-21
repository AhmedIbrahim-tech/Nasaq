using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Commands.ToggleLeaveTypeStatus;

public record ToggleLeaveTypeStatusCommand(Guid Id) : IRequest<GenericBaseResponse<LeaveTypeDto>>;
