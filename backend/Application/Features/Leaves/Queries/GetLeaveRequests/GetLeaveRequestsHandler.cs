using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Leaves.Queries.GetLeaveRequests;

public class GetLeaveRequestsHandler : IRequestHandler<GetLeaveRequestsQuery, GenericBaseResponse<PaginationResult<LeaveRequestDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetLeaveRequestsHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<PaginationResult<LeaveRequestDto>>> Handle(
        GetLeaveRequestsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.LeaveRequests
            .AsNoTracking()
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.ApprovalHistory)
            .AsQueryable();

        // Data scoping: If supervisor, only show requests for their directly assigned employees
        if (_currentUser.IsSupervisor && !_currentUser.IsAdmin && !_currentUser.IsSuperAdmin)
        {
            var currentSupervisor = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

            if (currentSupervisor != null)
            {
                query = query.Where(r => r.Employee != null && r.Employee.SupervisorId == currentSupervisor.Id);
            }
            else
            {
                // Fallback: supervisor has no employee record
                query = query.Where(r => false);
            }
        }

        if (request.EmployeeId.HasValue)
        {
            query = query.Where(r => r.EmployeeId == request.EmployeeId.Value);
        }

        if (request.LeaveTypeId.HasValue)
        {
            query = query.Where(r => r.LeaveTypeId == request.LeaveTypeId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(r => r.Status == request.Status.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(r => r.EndDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(r => r.StartDate <= request.ToDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var canReview = _currentUser.IsAdmin || _currentUser.IsSuperAdmin || _currentUser.IsSupervisor;

        var items = await query
            .OrderByDescending(r => r.SubmittedAtUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new LeaveRequestDto
            {
                Id = r.Id,
                EmployeeId = r.EmployeeId,
                EmployeeName = r.Employee != null ? r.Employee.FullName : string.Empty,
                EmployeeCode = r.Employee != null ? r.Employee.EmployeeCode : string.Empty,
                Department = r.Employee != null ? r.Employee.Department : null,
                LeaveTypeId = r.LeaveTypeId,
                LeaveTypeName = r.LeaveType != null ? r.LeaveType.Name : string.Empty,
                LeaveTypeNameAr = r.LeaveType != null ? r.LeaveType.NameAr : string.Empty,
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
                CanCancel = false,
                CanReview = canReview && r.Status == LeaveRequestStatus.Pending,
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
