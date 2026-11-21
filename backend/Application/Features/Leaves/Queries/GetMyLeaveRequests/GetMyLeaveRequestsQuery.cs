using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Leaves.Queries.GetMyLeaveRequests;

public record GetMyLeaveRequestsQuery(
    LeaveRequestStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 20,
    int? Page = null) : IRequest<GenericBaseResponse<PaginationResult<LeaveRequestDto>>>
{
    public int ResolvedPageNumber => Page ?? PageNumber;
}
