using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Queries.GetMyLeaveRequests;

public class GetMyLeaveRequestsHandler : IRequestHandler<GetMyLeaveRequestsQuery, GenericBaseResponse<PaginationResult<LeaveRequestDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyLeaveRequestsHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<PaginationResult<LeaveRequestDto>>> Handle(
        GetMyLeaveRequestsQuery request,
        CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<PaginationResult<LeaveRequestDto>>.Fail(
                "No employee profile found for the current user.",
                HttpStatusCode.NotFound);
        }

        var query = _context.LeaveRequests
            .AsNoTracking()
            .Include(r => r.LeaveType)
            .Include(r => r.ApprovalHistory)
            .Where(r => r.EmployeeId == employee.Id);

        if (request.Status.HasValue)
        {
            query = query.Where(r => r.Status == request.Status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var pageNumber = Math.Max(1, request.ResolvedPageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(r => r.SubmittedAtUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new LeaveRequestDto
            {
                Id = r.Id,
                EmployeeId = employee.Id,
                EmployeeName = employee.FullName,
                EmployeeNameAr = employee.FullNameAr,
                EmployeeCode = employee.EmployeeCode,
                Department = employee.Department,
                DepartmentAr = employee.DepartmentAr,
                LeaveTypeId = r.LeaveTypeId,
                LeaveTypeName = r.LeaveType != null ? r.LeaveType.Name : string.Empty,
                LeaveTypeNameAr = r.LeaveType != null
                    ? (!string.IsNullOrWhiteSpace(r.LeaveType.NameAr) ? r.LeaveType.NameAr : r.LeaveType.Name)
                    : string.Empty,
                LeaveTypeCode = r.LeaveType != null ? r.LeaveType.Code : string.Empty,
                IsPaid = r.LeaveType != null && r.LeaveType.IsPaid,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                DaysCount = r.DaysCount,
                Reason = r.Reason,
                AttachmentFileId = r.AttachmentFileId,
                Status = r.Status.ToString(),
                SubmittedAtUtc = r.SubmittedAtUtc,
                ReviewedAtUtc = r.ReviewedAtUtc,
                ReviewedBy = r.ReviewedBy,
                ReviewNotes = r.ReviewNotes,
                CanCancel = r.Status == LeaveRequestStatus.Pending,
                CanReview = false,
                ApprovalHistory = r.ApprovalHistory
                    .OrderBy(h => h.ActionDateUtc)
                    .Select(h => new LeaveApprovalHistoryDto
                    {
                        Id = h.Id,
                        LeaveRequestId = h.LeaveRequestId,
                        ActorId = h.ActorId,
                        ActorName = h.ActorName,
                        Action = h.Action.ToString(),
                        Comments = h.Comments,
                        ActionDateUtc = h.ActionDateUtc
                    }).ToList()
            })
            .ToListAsync(cancellationToken);

        var pagination = PaginationResult<LeaveRequestDto>.Success(items, totalCount, pageNumber, pageSize);
        return GenericBaseResponse<PaginationResult<LeaveRequestDto>>.Success(pagination);
    }
}
