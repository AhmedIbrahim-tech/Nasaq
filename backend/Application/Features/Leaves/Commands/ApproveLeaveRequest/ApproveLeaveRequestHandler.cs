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
    private readonly ICurrentLanguage? _currentLanguage;

    public ApproveLeaveRequestHandler(
        IApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser,
        INotificationService notificationService,
        ICurrentLanguage? currentLanguage = null)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _notificationService = notificationService;
        _currentLanguage = currentLanguage;
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

        var isAr = _currentLanguage == null || _currentLanguage.LanguageCode.StartsWith("ar", StringComparison.OrdinalIgnoreCase);

        if (leaveRequest == null)
        {
            var notFoundMsg = isAr ? "طلب الإجازة غير موجود." : "Leave request not found.";
            return GenericBaseResponse<LeaveRequestDto>.Fail(notFoundMsg, HttpStatusCode.NotFound);
        }

        if (leaveRequest.Status != LeaveRequestStatus.Pending)
        {
            var statusMsg = isAr
                ? "لا يمكن اعتماد هذا الطلب لأنه ليس في حالة قيد الانتظار."
                : $"Cannot approve a request with status '{leaveRequest.Status}'. Only pending requests can be approved.";
            return GenericBaseResponse<LeaveRequestDto>.Fail(statusMsg, HttpStatusCode.BadRequest);
        }

        // Self-approval safeguard: Check both User ID and Employee record mapping
        var isOwnRequest = (!string.IsNullOrEmpty(_currentUser.UserId) && leaveRequest.Employee?.UserId == _currentUser.UserId)
            || (_currentUser.UserId != null && leaveRequest.EmployeeId == (await _context.Employees.Where(e => e.UserId == _currentUser.UserId).Select(e => e.Id).FirstOrDefaultAsync(cancellationToken)));

        if (isOwnRequest)
        {
            var msg = isAr
                ? "لا يمكنك اعتماد طلب الإجازة الخاص بك."
                : "You cannot approve your own leave request.";
            return GenericBaseResponse<LeaveRequestDto>.Fail(msg, HttpStatusCode.Forbidden);
        }

        // Supervisor authorization check: Supervisor can only approve for direct subordinates
        if (_currentUser.IsSupervisor && !_currentUser.IsAdmin && !_currentUser.IsSuperAdmin)
        {
            var currentSupervisor = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

            if (currentSupervisor == null || leaveRequest.Employee?.SupervisorId != currentSupervisor.Id)
            {
                var authMsg = isAr
                    ? "أنت مصرح فقط بمراجعة طلبات الإجازة للموظفين التابعين لفريقك."
                    : "You are only authorized to approve leave requests for your assigned team members.";
                return GenericBaseResponse<LeaveRequestDto>.Fail(authMsg, HttpStatusCode.Forbidden);
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

        var successMsg = isAr ? "تم اعتماد طلب الإجازة بنجاح." : "Leave request approved successfully.";
        return GenericBaseResponse<LeaveRequestDto>.Success(dto, successMsg);
    }
}
