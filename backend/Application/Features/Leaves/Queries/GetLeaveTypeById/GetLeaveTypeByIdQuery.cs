using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Queries.GetLeaveTypeById;

public record GetLeaveTypeByIdQuery(Guid Id) : IRequest<GenericBaseResponse<LeaveTypeDto>>;
