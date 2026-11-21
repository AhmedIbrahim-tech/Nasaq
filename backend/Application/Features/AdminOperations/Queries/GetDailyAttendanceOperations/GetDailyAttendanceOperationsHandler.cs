using Application.Abstractions;
using Application.Common;
using Application.Features.Attendance.DTOs;
using Domain.Authorization;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.AdminOperations.Queries.GetDailyAttendanceOperations;

public class GetDailyAttendanceOperationsHandler : IRequestHandler<GetDailyAttendanceOperationsQuery, GenericBaseResponse<PaginationResult<AttendanceRecordDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetDailyAttendanceOperationsHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<PaginationResult<AttendanceRecordDto>>> Handle(
        GetDailyAttendanceOperationsQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<PaginationResult<AttendanceRecordDto>>.Unauthorized();
        }

        var isSuperAdmin = _currentUser.Roles.Contains(RoleNames.SuperAdmin);
        var isAdmin = _currentUser.Roles.Contains(RoleNames.Admin);
        var isSupervisor = _currentUser.Roles.Contains(RoleNames.Supervisor);

        var query = _context.AttendanceRecords
            .Include(a => a.Employee)
            .Include(a => a.WorkShift)
            .Include(a => a.WorkLocation)
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

        if (request.Date.HasValue)
        {
            query = query.Where(a => a.Date == request.Date.Value);
        }

        if (request.WorkLocationId.HasValue)
        {
            query = query.Where(a => a.WorkLocationId == request.WorkLocationId.Value);
        }

        if (request.WorkShiftId.HasValue)
        {
            query = query.Where(a => a.WorkShiftId == request.WorkShiftId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(a => a.Status == request.Status.Value);
        }

        if (request.MissingCheckOutOnly == true)
        {
            query = query.Where(a => a.CheckOutTimeUtc == null && a.CheckInStatus == VerificationStatus.Verified);
        }

        if (request.PendingReviewOnly == true)
        {
            query = query.Where(a => a.CheckInStatus == VerificationStatus.PendingReview || a.CheckOutStatus == VerificationStatus.PendingReview);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(a =>
                (a.Employee != null && (a.Employee.FirstName.ToLower().Contains(term) ||
                                       a.Employee.LastName.ToLower().Contains(term) ||
                                       a.Employee.EmployeeCode.ToLower().Contains(term) ||
                                       (a.Employee.Department != null && a.Employee.Department.ToLower().Contains(term)))) ||
                (a.WorkLocation != null && a.WorkLocation.Name.ToLower().Contains(term)) ||
                (a.WorkShift != null && a.WorkShift.Name.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.CheckInTimeUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(AttendanceRecordDto.FromEntity).ToList();
        var result = PaginationResult<AttendanceRecordDto>.Success(dtos, totalCount, page, pageSize);

        return GenericBaseResponse<PaginationResult<AttendanceRecordDto>>.Success(result);
    }
}
