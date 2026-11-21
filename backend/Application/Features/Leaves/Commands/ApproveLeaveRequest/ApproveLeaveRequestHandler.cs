using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Commands.ApproveLeaveRequest;

public class ApproveLeaveRequestHandler : IRequestHandler<ApproveLeaveRequestCommand, GenericBaseResponse<LeaveRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;
    private readonly INotificationService _notificationService;

    public ApproveLeaveRequestHandler(
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
        ApproveLeaveRequestCommand request,
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

        if (leaveRequest.Status != LeaveRequestStatus.Pending)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail(
                $"Cannot approve a request with status '{leaveRequest.Status}'. Only pending requests can be approved.",
                HttpStatusCode.BadRequest);
        }

        // Self-approval safeguard: Employees cannot approve their own requests
        if (!string.IsNullOrEmpty(_currentUser.UserId) && leaveRequest.Employee?.UserId == _currentUser.UserId)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail(
                "You cannot approve your own leave request.",
                HttpStatusCode.Forbidden);
        }

        // Supervisor authorization check: Supervisor can only approve for direct subordinates
        if (_currentUser.IsSupervisor && !_currentUser.IsAdmin && !_currentUser.IsSuperAdmin)
        {
            var currentSupervisor = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

            if (currentSupervisor == null || leaveRequest.Employee?.SupervisorId != currentSupervisor.Id)
            {
                return GenericBaseResponse<LeaveRequestDto>.Fail(
                    "You are only authorized to approve leave requests for your assigned team members.",
                    HttpStatusCode.Forbidden);
            }
        }

        var nowUtc = DateTime.UtcNow;
        leaveRequest.Status = LeaveRequestStatus.Approved;
        leaveRequest.ReviewedAtUtc = nowUtc;
        leaveRequest.ReviewedBy = _currentUser.UserName ?? "Supervisor";
        leaveRequest.ReviewNotes = request.ReviewNotes?.Trim();

        var historyEntry = new LeaveApprovalHistory
        {
            Id = Guid.NewGuid(),
            LeaveRequestId = leaveRequest.Id,
            ActorId = _currentUser.UserId ?? "SYSTEM",
            ActorName = _currentUser.UserName ?? "Approver",
            Action = LeaveApprovalAction.Approved,
            Comments = request.ReviewNotes?.Trim() ?? "Approved.",
            ActionDateUtc = nowUtc
        };

        await _context.LeaveApprovalHistories.AddAsync(historyEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Notify employee
        if (leaveRequest.Employee?.UserId != null)
        {
            await _notificationService.CreateAsync(
                leaveRequest.Employee.UserId,
                "Leave Request Approved",
                $"Your {leaveRequest.LeaveType?.Name} request ({leaveRequest.StartDate:yyyy-MM-dd} to {leaveRequest.EndDate:yyyy-MM-dd}) has been approved.",
                NotificationCategory.Success,
                null,
                cancellationToken);
        }

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

        return GenericBaseResponse<LeaveRequestDto>.Success(dto, "Leave request approved successfully.");
    }
}
