using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Commands.SubmitLeaveRequest;

public class SubmitLeaveRequestHandler : IRequestHandler<SubmitLeaveRequestCommand, GenericBaseResponse<LeaveRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;
    private readonly ILeaveService _leaveService;
    private readonly IFileService _fileService;
    private readonly INotificationService _notificationService;

    public SubmitLeaveRequestHandler(
        IApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser,
        ILeaveService leaveService,
        IFileService fileService,
        INotificationService notificationService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _leaveService = leaveService;
        _fileService = fileService;
        _notificationService = notificationService;
    }

    public async Task<GenericBaseResponse<LeaveRequestDto>> Handle(
        SubmitLeaveRequestCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Resolve employee identity securely
        Employee? employee;

        if (request.EmployeeId.HasValue && (_currentUser.IsAdmin || _currentUser.IsSuperAdmin))
        {
            employee = await _context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == request.EmployeeId.Value, cancellationToken);
        }
        else
        {
            employee = await _context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);
        }

        if (employee == null || !employee.IsActive)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail(
                "No active employee profile is associated with this request.",
                HttpStatusCode.Forbidden);
        }

        // 2. Validate leave type
        var leaveType = await _context.LeaveTypes
            .FirstOrDefaultAsync(t => t.Id == request.LeaveTypeId, cancellationToken);

        if (leaveType == null || !leaveType.IsActive)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail(
                "The selected leave type is not active or does not exist.",
                HttpStatusCode.BadRequest);
        }

        // 3. Validate attachment requirement
        if (leaveType.RequiresAttachment && request.Attachment == null)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail(
                $"Supporting document attachment is required for '{leaveType.Name}'.",
                HttpStatusCode.BadRequest);
        }

        // 4. Validate non-overlapping dates
        var hasOverlap = await _leaveService.HasOverlappingLeaveAsync(
            employee.Id,
            request.StartDate,
            request.EndDate,
            excludeRequestId: null,
            cancellationToken);

        if (hasOverlap)
        {
            return GenericBaseResponse<LeaveRequestDto>.Fail(
                "You already have a pending or approved leave request covering the specified date range.",
                HttpStatusCode.Conflict);
        }

        // 5. Calculate effective duration via schedule (MOD-04)
        var daysCount = await _leaveService.CalculateLeaveDurationAsync(
            employee.Id,
            request.StartDate,
            request.EndDate,
            cancellationToken);

        // 6. Handle optional attachment file upload
        Guid? attachmentFileId = null;
        if (request.Attachment != null)
        {
            var storedFile = await _fileService.SaveAsync(
                request.Attachment,
                FileCategory.LeaveRequests,
                employee.Id,
                cancellationToken);

            attachmentFileId = storedFile.Id;
        }

        // 7. Create LeaveRequest
        var nowUtc = DateTime.UtcNow;
        var leaveRequest = new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            DaysCount = daysCount,
            Reason = request.Reason?.Trim(),
            AttachmentFileId = attachmentFileId,
            Status = LeaveRequestStatus.Pending,
            SubmittedAtUtc = nowUtc
        };

        // 8. Add audit history
        var historyEntry = new LeaveApprovalHistory
        {
            Id = Guid.NewGuid(),
            LeaveRequestId = leaveRequest.Id,
            ActorId = _currentUser.UserId ?? employee.Id.ToString(),
            ActorName = employee.FullName,
            Action = LeaveApprovalAction.Submitted,
            Comments = request.Reason?.Trim(),
            ActionDateUtc = nowUtc
        };

        await _context.LeaveRequests.AddAsync(leaveRequest, cancellationToken);
        await _context.LeaveApprovalHistories.AddAsync(historyEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 9. Send notifications: Notify both employee and their supervisor/approvers
        if (!string.IsNullOrEmpty(employee.UserId))
        {
            await _notificationService.CreateAsync(
                employee.UserId,
                "Leave Request Submitted",
                $"Your {leaveType.Name} request ({request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}) was submitted and is pending review.",
                NotificationCategory.Info,
                "/leaves",
                cancellationToken);
        }

        // Notify supervisor or admin approvers
        string? approverUserId = null;
        if (employee.SupervisorId.HasValue)
        {
            var supervisor = await _context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == employee.SupervisorId.Value, cancellationToken);
            approverUserId = supervisor?.UserId;
        }

        if (!string.IsNullOrEmpty(approverUserId))
        {
            await _notificationService.CreateAsync(
                approverUserId,
                "Leave Request Pending Review",
                $"{employee.FullName} submitted a {leaveType.Name} request ({request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}) pending your review.",
                NotificationCategory.Warning,
                "/leaves",
                cancellationToken);
        }
        else
        {
            // If employee has no supervisor assigned, notify administrators
            var adminRoleIds = await _context.Roles
                .Where(r => r.Name == Domain.Authorization.RoleNames.Admin || r.Name == Domain.Authorization.RoleNames.SuperAdmin)
                .Select(r => r.Id)
                .ToListAsync(cancellationToken);

            var adminUserIds = await _context.UserRoles
                .Where(ur => adminRoleIds.Contains(ur.RoleId))
                .Select(ur => ur.UserId)
                .Distinct()
                .Take(5)
                .ToListAsync(cancellationToken);

            foreach (var adminId in adminUserIds)
            {
                await _notificationService.CreateAsync(
                    adminId,
                    "Leave Request Pending Review",
                    $"{employee.FullName} submitted a {leaveType.Name} request ({request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}) pending review.",
                    NotificationCategory.Warning,
                    "/leaves",
                    cancellationToken);
            }
        }

        var dto = new LeaveRequestDto
        {
            Id = leaveRequest.Id,
            EmployeeId = employee.Id,
            EmployeeName = employee.FullName,
            EmployeeNameAr = employee.FullNameAr,
            EmployeeCode = employee.EmployeeCode,
            Department = employee.Department,
            DepartmentAr = employee.DepartmentAr,
            LeaveTypeId = leaveType.Id,
            LeaveTypeName = leaveType.Name,
            LeaveTypeNameAr = leaveType.NameAr,
            LeaveTypeCode = leaveType.Code,
            IsPaid = leaveType.IsPaid,
            StartDate = leaveRequest.StartDate,
            EndDate = leaveRequest.EndDate,
            DaysCount = leaveRequest.DaysCount,
            Reason = leaveRequest.Reason,
            AttachmentFileId = leaveRequest.AttachmentFileId,
            Status = leaveRequest.Status.ToString(),
            SubmittedAtUtc = leaveRequest.SubmittedAtUtc,
            CanCancel = true,
            CanReview = false,
            ApprovalHistory = new List<LeaveApprovalHistoryDto>
            {
                new()
                {
                    Id = historyEntry.Id,
                    LeaveRequestId = historyEntry.LeaveRequestId,
                    ActorId = historyEntry.ActorId,
                    ActorName = historyEntry.ActorName,
                    Action = historyEntry.Action.ToString(),
                    Comments = historyEntry.Comments,
                    ActionDateUtc = historyEntry.ActionDateUtc
                }
            }
        };

        return GenericBaseResponse<LeaveRequestDto>.Success(
            dto,
            "Leave request submitted successfully.",
            HttpStatusCode.Created);
    }
}
