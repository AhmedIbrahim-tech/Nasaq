using Application.Abstractions;
using Application.Common;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Attendance.Queries.GetMyAttendanceHistory;

public class GetMyAttendanceHistoryHandler : IRequestHandler<GetMyAttendanceHistoryQuery, GenericBaseResponse<PaginationResult<AttendanceRecordDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyAttendanceHistoryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<PaginationResult<AttendanceRecordDto>>> Handle(GetMyAttendanceHistoryQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<PaginationResult<AttendanceRecordDto>>.Unauthorized("User is not authenticated.");
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<PaginationResult<AttendanceRecordDto>>.Fail("No active employee profile associated with the current user.", HttpStatusCode.Forbidden);
        }

        var query = _context.AttendanceRecords
            .Include(a => a.WorkLocation)
            .Include(a => a.WorkShift)
            .Include(a => a.Employee)
            .Where(a => a.EmployeeId == employee.Id)
            .AsNoTracking();

        if (request.StartDate.HasValue)
        {
            query = query.Where(a => a.Date >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(a => a.Date <= request.EndDate.Value);
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
