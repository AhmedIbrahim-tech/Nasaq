using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Queries.GetLeaveTypes;

public record GetLeaveTypesQuery(bool ActiveOnly = false) : IRequest<GenericBaseResponse<List<LeaveTypeDto>>>;
