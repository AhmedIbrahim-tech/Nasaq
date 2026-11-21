using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Leaves.Queries.GetLeaveRequests;

public record GetLeaveRequestsQuery(
    Guid? EmployeeId = null,
    Guid? LeaveTypeId = null,
    LeaveRequestStatus? Status = null,
    DateOnly? FromDate = null,
    DateOnly? ToDate = null,
    int PageNumber = 1,
    int PageSize = 20,
    int? Page = null) : IRequest<GenericBaseResponse<PaginationResult<LeaveRequestDto>>>
{
    public int ResolvedPageNumber => Page ?? PageNumber;
}
