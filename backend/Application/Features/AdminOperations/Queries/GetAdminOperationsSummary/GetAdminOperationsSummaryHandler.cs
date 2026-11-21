using Application.Abstractions;
using Application.Features.AdminOperations.DTOs;
using Domain.Authorization;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.AdminOperations.Queries.GetAdminOperationsSummary;

public class GetAdminOperationsSummaryHandler : IRequestHandler<GetAdminOperationsSummaryQuery, GenericBaseResponse<AdminOperationsSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetAdminOperationsSummaryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<AdminOperationsSummaryDto>> Handle(
        GetAdminOperationsSummaryQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<AdminOperationsSummaryDto>.Unauthorized();
        }

        var isSuperAdmin = _currentUser.Roles.Contains(RoleNames.SuperAdmin);
        var isAdmin = _currentUser.Roles.Contains(RoleNames.Admin);
        var isSupervisor = _currentUser.Roles.Contains(RoleNames.Supervisor);

        var query = _context.AttendanceRecords
            .Include(a => a.Employee)
            .AsNoTracking();

        if (isSupervisor && !isAdmin && !isSuperAdmin)
        {
            var supervisorEmployee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

            if (supervisorEmployee != null)
            {
                query = query.Where(a => a.Employee != null && a.Employee.SupervisorId == supervisorEmployee.Id);
            }
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var pendingGpsExceptions = await query.CountAsync(
            a => a.CheckInStatus == VerificationStatus.PendingReview ||
                 a.CheckOutStatus == VerificationStatus.PendingReview,
            cancellationToken);

        var incompleteCount = await query.CountAsync(
            a => a.CheckOutTimeUtc == null && a.CheckInStatus == VerificationStatus.Verified,
            cancellationToken);

        var todayRecords = query.Where(a => a.Date == today);

        var todayTotal = await todayRecords.CountAsync(cancellationToken);
        var todayVerified = await todayRecords.CountAsync(
            a => a.CheckInStatus == VerificationStatus.Verified, cancellationToken);
        var todayPending = await todayRecords.CountAsync(
            a => a.CheckInStatus == VerificationStatus.PendingReview || a.CheckOutStatus == VerificationStatus.PendingReview, cancellationToken);
        var todayRejected = await todayRecords.CountAsync(
            a => a.CheckInStatus == VerificationStatus.Rejected || a.Status == AttendanceStatus.Rejected, cancellationToken);

        var summary = new AdminOperationsSummaryDto
        {
            PendingGpsExceptionsCount = pendingGpsExceptions,
            IncompleteAttendanceCount = incompleteCount,
            TodayTotalAttendance = todayTotal,
            TodayVerifiedCount = todayVerified,
            TodayPendingCount = todayPending,
            TodayRejectedCount = todayRejected
        };

        return GenericBaseResponse<AdminOperationsSummaryDto>.Success(summary);
    }
}
