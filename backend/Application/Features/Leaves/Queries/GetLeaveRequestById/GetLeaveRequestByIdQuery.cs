using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Queries.GetLeaveRequestById;

public record GetLeaveRequestByIdQuery(Guid Id) : IRequest<GenericBaseResponse<LeaveRequestDto>>;
