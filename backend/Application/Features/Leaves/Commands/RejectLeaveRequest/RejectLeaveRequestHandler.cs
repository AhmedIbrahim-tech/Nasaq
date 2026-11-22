using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Commands.RejectLeaveRequest;

public class RejectLeaveRequestHandler : IRequestHandler<RejectLeaveRequestCommand, GenericBaseResponse<LeaveRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;
    private readonly INotificationService _notificationService;
    private readonly ICurrentLanguage? _currentLanguage;

    public RejectLeaveRequestHandler(
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
        RejectLeaveRequestCommand request,
        CancellationToken cancellationToken)
    {
        var leaveRequest = await _context.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.ApprovalHistory)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (leaveRequest == null)
        {
            var notFoundMsg = _currentLanguage != null && _currentLanguage.LanguageCode.StartsWith("ar", StringComparison.OrdinalIgnoreCase)
                ? "طلب الإجازة غير موجود."
                : "Leave request not found.";
            return GenericBaseResponse<LeaveRequestDto>.Fail(notFoundMsg, HttpStatusCode.NotFound);
        }

        if (leaveRequest.Status != LeaveRequestStatus.Pending)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail(
                $"Cannot reject a request with status '{leaveRequest.Status}'. Only pending requests can be rejected.",
                HttpStatusCode.BadRequest);
        }

        // Self-rejection safeguard
        if (!string.IsNullOrEmpty(_currentUser.UserId) && leaveRequest.Employee?.UserId == _currentUser.UserId)
        {
            var isEn = _currentLanguage != null && _currentLanguage.LanguageCode.StartsWith("en", StringComparison.OrdinalIgnoreCase);
            var msg = isEn
                ? "You cannot reject your own leave request. Use cancel instead."
                : "لا يمكنك رفض طلب الإجازة الخاص بك. يرجى استخدام خيار الإلغاء بدلاً من ذلك.";
            return GenericBaseResponse<LeaveRequestDto>.Fail(msg, HttpStatusCode.Forbidden);
        }

        // Supervisor authorization check
        if (_currentUser.IsSupervisor && !_currentUser.IsAdmin && !_currentUser.IsSuperAdmin)
        {
            var currentSupervisor = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

            if (currentSupervisor == null || leaveRequest.Employee?.SupervisorId != currentSupervisor.Id)
            {
                return GenericBaseResponse<LeaveRequestDto>.Fail(
                    "You are only authorized to review leave requests for your assigned team members.",
                    HttpStatusCode.Forbidden);
            }
        }

        var nowUtc = DateTime.UtcNow;
        leaveRequest.Status = LeaveRequestStatus.Rejected;
        leaveRequest.ReviewedAtUtc = nowUtc;
        leaveRequest.ReviewedBy = _currentUser.UserName ?? "Supervisor";
        leaveRequest.ReviewNotes = request.Reason.Trim();

        var historyEntry = new LeaveApprovalHistory
        {
            Id = Guid.NewGuid(),
            LeaveRequestId = leaveRequest.Id,
            ActorId = _currentUser.UserId ?? "SYSTEM",
            ActorName = _currentUser.UserName ?? "Reviewer",
            Action = LeaveApprovalAction.Rejected,
            Comments = request.Reason.Trim(),
            ActionDateUtc = nowUtc
        };

        await _context.LeaveApprovalHistories.AddAsync(historyEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Notify employee
        if (leaveRequest.Employee?.UserId != null)
        {
            await _notificationService.CreateAsync(
                leaveRequest.Employee.UserId,
                "Leave Request Rejected",
                $"Your {leaveRequest.LeaveType?.Name} request ({leaveRequest.StartDate:yyyy-MM-dd} to {leaveRequest.EndDate:yyyy-MM-dd}) was rejected: {request.Reason.Trim()}",
                NotificationCategory.Warning,
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

        return GenericBaseResponse<LeaveRequestDto>.Success(dto, "Leave request rejected successfully.");
    }
}
