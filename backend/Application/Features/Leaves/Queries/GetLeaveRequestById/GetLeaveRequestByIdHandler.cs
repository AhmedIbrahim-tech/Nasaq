using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Queries.GetLeaveRequestById;

public class GetLeaveRequestByIdHandler : IRequestHandler<GetLeaveRequestByIdQuery, GenericBaseResponse<LeaveRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetLeaveRequestByIdHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<LeaveRequestDto>> Handle(
        GetLeaveRequestByIdQuery request,
        CancellationToken cancellationToken)
    {
        var leaveRequest = await _context.LeaveRequests
            .AsNoTracking()
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.ApprovalHistory)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (leaveRequest == null)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail("Leave request not found.", HttpStatusCode.NotFound);
        }

        // Authorization check: User can view if SuperAdmin/Admin, or their own request, or their subordinate
        var isOwner = !string.IsNullOrEmpty(_currentUser.UserId) && leaveRequest.Employee?.UserId == _currentUser.UserId;
        var isAdmin = _currentUser.IsAdmin || _currentUser.IsSuperAdmin;
        var isSupervisor = false;

        if (_currentUser.IsSupervisor && !isAdmin)
        {
            var currentSupervisor = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

            isSupervisor = currentSupervisor != null && leaveRequest.Employee?.SupervisorId == currentSupervisor.Id;
        }

        if (!isOwner && !isAdmin && !isSupervisor)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail(
                "You are not authorized to view this leave request.",
                HttpStatusCode.Forbidden);
        }

        var canReview = (isAdmin || isSupervisor) && !isOwner && leaveRequest.Status == LeaveRequestStatus.Pending;

        var dto = new LeaveRequestDto
        {
            Id = leaveRequest.Id,
            EmployeeId = leaveRequest.EmployeeId,
            EmployeeName = leaveRequest.Employee?.FullName ?? string.Empty,
            EmployeeCode = leaveRequest.Employee?.EmployeeCode ?? string.Empty,
            Department = leaveRequest.Employee?.Department,
            LeaveTypeId = leaveRequest.LeaveTypeId,
            LeaveTypeName = leaveRequest.LeaveType?.Name ?? string.Empty,
            LeaveTypeNameAr = leaveRequest.LeaveType?.NameAr ?? string.Empty,
            LeaveTypeCode = leaveRequest.LeaveType?.Code ?? string.Empty,
            IsPaid = leaveRequest.LeaveType?.IsPaid ?? true,
            StartDate = leaveRequest.StartDate,
            EndDate = leaveRequest.EndDate,
            DaysCount = leaveRequest.DaysCount,
            Reason = leaveRequest.Reason,
            AttachmentFileId = leaveRequest.AttachmentFileId,
            Status = leaveRequest.Status.ToString(),
            SubmittedAtUtc = leaveRequest.SubmittedAtUtc,
            ReviewedAtUtc = leaveRequest.ReviewedAtUtc,
            ReviewedBy = leaveRequest.ReviewedBy,
            ReviewNotes = leaveRequest.ReviewNotes,
            CanCancel = isOwner && leaveRequest.Status == LeaveRequestStatus.Pending,
            CanReview = canReview,
            ApprovalHistory = leaveRequest.ApprovalHistory
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
        };

        return GenericBaseResponse<LeaveRequestDto>.Success(dto);
    }
}
