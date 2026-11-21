using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Commands.ApproveLeaveRequest;

public record ApproveLeaveRequestCommand(Guid Id, string? ReviewNotes = null) : IRequest<GenericBaseResponse<LeaveRequestDto>>;
