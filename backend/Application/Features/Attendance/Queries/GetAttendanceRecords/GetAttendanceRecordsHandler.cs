using System.Net;
using Application.Abstractions;
using Application.Common;
using Application.Features.Attendance.DTOs;
using Domain.Authorization;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Attendance.Queries.GetAttendanceRecords;

public class GetAttendanceRecordsHandler : IRequestHandler<GetAttendanceRecordsQuery, GenericBaseResponse<PaginationResult<AttendanceRecordDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetAttendanceRecordsHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<PaginationResult<AttendanceRecordDto>>> Handle(
        GetAttendanceRecordsQuery request,
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
            .Include(a => a.WorkLocation)
            .Include(a => a.WorkShift)
            .Include(a => a.Employee)
            .AsNoTracking();

        // Supervisor scoping: only see supervised team members
        if (isSupervisor && !isAdmin && !isSuperAdmin)
        {
            var supervisorEmployee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

            if (supervisorEmployee == null)
            {
                return GenericBaseResponse<PaginationResult<AttendanceRecordDto>>.Fail(
                    "Supervisor employee record not found.", HttpStatusCode.Forbidden);
            }

            query = query.Where(a => a.Employee != null && a.Employee.SupervisorId == supervisorEmployee.Id);
        }

        if (request.EmployeeId.HasValue)
        {
            query = query.Where(a => a.EmployeeId == request.EmployeeId.Value);
        }

        if (request.WorkLocationId.HasValue)
        {
            query = query.Where(a => a.WorkLocationId == request.WorkLocationId.Value);
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(a => a.Date >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(a => a.Date <= request.EndDate.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(a => a.Status == request.Status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(a => a.CheckInTimeUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(AttendanceRecordDto.FromEntity).ToList();
        var result = PaginationResult<AttendanceRecordDto>.Success(dtos, totalCount, page, pageSize);

        return GenericBaseResponse<PaginationResult<AttendanceRecordDto>>.Success(result);
    }
}
