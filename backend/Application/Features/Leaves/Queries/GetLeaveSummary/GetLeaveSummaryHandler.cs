using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Leaves.Queries.GetLeaveSummary;

public class GetLeaveSummaryHandler : IRequestHandler<GetLeaveSummaryQuery, GenericBaseResponse<LeaveSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetLeaveSummaryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<LeaveSummaryDto>> Handle(
        GetLeaveSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var summary = new LeaveSummaryDto();

        // System-wide counts (scoped for supervisor or global for admin)
        var query = _context.LeaveRequests.AsNoTracking().AsQueryable();

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
                query = query.Where(r => false);
            }
        }

        summary.TotalPending = await query.CountAsync(r => r.Status == LeaveRequestStatus.Pending, cancellationToken);
        summary.TotalApproved = await query.CountAsync(r => r.Status == LeaveRequestStatus.Approved, cancellationToken);
        summary.TotalRejected = await query.CountAsync(r => r.Status == LeaveRequestStatus.Rejected, cancellationToken);
        summary.TotalCancelled = await query.CountAsync(r => r.Status == LeaveRequestStatus.Cancelled, cancellationToken);

        // Current employee counts
        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

        if (employee != null)
        {
            var currentYear = DateTime.UtcNow.Year;
            var startOfYear = new DateOnly(currentYear, 1, 1);
            var endOfYear = new DateOnly(currentYear, 12, 31);

            summary.MyPendingCount = await _context.LeaveRequests
                .AsNoTracking()
                .CountAsync(r => r.EmployeeId == employee.Id && r.Status == LeaveRequestStatus.Pending, cancellationToken);

            summary.MyApprovedDaysThisYear = await _context.LeaveRequests
                .AsNoTracking()
                .Where(r => r.EmployeeId == employee.Id && r.Status == LeaveRequestStatus.Approved && r.StartDate >= startOfYear && r.StartDate <= endOfYear)
                .SumAsync(r => r.DaysCount, cancellationToken);
        }

        return GenericBaseResponse<LeaveSummaryDto>.Success(summary);
    }
}
