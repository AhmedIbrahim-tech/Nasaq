using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Commands.CancelLeaveRequest;

public class CancelLeaveRequestHandler : IRequestHandler<CancelLeaveRequestCommand, GenericBaseResponse<LeaveRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;
    private readonly INotificationService _notificationService;

    public CancelLeaveRequestHandler(
        IApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser,
        INotificationService notificationService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _notificationService = notificationService;
    }

    public async Task<GenericBaseResponse<LeaveRequestDto>> Handle(
        CancelLeaveRequestCommand request,
        CancellationToken cancellationToken)
    {
        var leaveRequest = await _context.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.ApprovalHistory)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (leaveRequest == null)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail("Leave request not found.", HttpStatusCode.NotFound);
        }

        // Authorization check: only request owner or Admin/SuperAdmin
        var isOwner = !string.IsNullOrEmpty(_currentUser.UserId) && leaveRequest.Employee?.UserId == _currentUser.UserId;
        var isAdmin = _currentUser.IsAdmin || _currentUser.IsSuperAdmin;

        if (!isOwner && !isAdmin)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail("You are not authorized to cancel this leave request.", HttpStatusCode.Forbidden);
        }

        // Cancellation rules: can cancel if Pending, or Approved but start date hasn't passed
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (leaveRequest.Status != LeaveRequestStatus.Pending)
        {
            if (leaveRequest.Status == LeaveRequestStatus.Approved && leaveRequest.StartDate > today && isAdmin)
            {
                // Admin cancellation of upcoming approved leave
            }
            else
            {
                return GenericBaseResponse<LeaveRequestDto>.Fail(
                    $"Cannot cancel a leave request with status '{leaveRequest.Status}'.",
                    HttpStatusCode.BadRequest);
            }
        }

        var nowUtc = DateTime.UtcNow;
        leaveRequest.Status = LeaveRequestStatus.Cancelled;

        var historyEntry = new LeaveApprovalHistory
        {
            Id = Guid.NewGuid(),
            LeaveRequestId = leaveRequest.Id,
            ActorId = _currentUser.UserId ?? "SYSTEM",
            ActorName = _currentUser.UserName ?? "User",
            Action = LeaveApprovalAction.Cancelled,
            Comments = request.Reason?.Trim() ?? "Request cancelled by user.",
            ActionDateUtc = nowUtc
        };

        await _context.LeaveApprovalHistories.AddAsync(historyEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (leaveRequest.Employee?.UserId != null)
        {
            await _notificationService.CreateAsync(
                leaveRequest.Employee.UserId,
                "Leave Request Cancelled",
                $"Your leave request from {leaveRequest.StartDate:yyyy-MM-dd} to {leaveRequest.EndDate:yyyy-MM-dd} has been cancelled.",
                NotificationCategory.Info,
                null,
                cancellationToken);
        }

        var dto = new LeaveRequestDto
        {
            Id = leaveRequest.Id,
            EmployeeId = leaveRequest.EmployeeId,
            EmployeeName = leaveRequest.Employee?.FullName ?? string.Empty,
            EmployeeNameAr = leaveRequest.Employee?.FullNameAr,
            EmployeeCode = leaveRequest.Employee?.EmployeeCode ?? string.Empty,
            Department = leaveRequest.Employee?.Department,
            DepartmentAr = leaveRequest.Employee?.DepartmentAr,
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
            CanCancel = false,
            CanReview = false,
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

        return GenericBaseResponse<LeaveRequestDto>.Success(dto, "Leave request cancelled successfully.");
    }
}
