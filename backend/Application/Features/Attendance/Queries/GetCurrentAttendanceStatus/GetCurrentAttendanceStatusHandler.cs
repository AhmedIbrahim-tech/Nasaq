using Application.Abstractions;
using Application.Features.Attendance.DTOs;
using Application.Features.Shifts.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Attendance.Queries.GetCurrentAttendanceStatus;

public class GetCurrentAttendanceStatusHandler : IRequestHandler<GetCurrentAttendanceStatusQuery, GenericBaseResponse<CurrentAttendanceStatusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IShiftResolutionService _shiftResolutionService;

    public GetCurrentAttendanceStatusHandler(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IShiftResolutionService shiftResolutionService)
    {
        _context = context;
        _currentUser = currentUser;
        _shiftResolutionService = shiftResolutionService;
    }

    public async Task<GenericBaseResponse<CurrentAttendanceStatusDto>> Handle(GetCurrentAttendanceStatusQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<CurrentAttendanceStatusDto>.Unauthorized("User is not authenticated.");
        }

        var employee = await _context.Employees
            .Include(e => e.WorkLocation)
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<CurrentAttendanceStatusDto>.Fail("No active employee profile associated with the current user.", HttpStatusCode.Forbidden);
        }

        var utcNow = DateTime.UtcNow;
        var todayDate = DateOnly.FromDateTime(utcNow);

        // 1. Resolve open active record (if any)
        var activeRecord = await _context.AttendanceRecords
            .Include(a => a.WorkLocation)
            .Include(a => a.WorkShift)
            .Include(a => a.Employee)
            .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.CheckOutTimeUtc == null, cancellationToken);

        // If no open session, check if there was a completed session today
        AttendanceRecordDto? activeDto = null;
        if (activeRecord != null)
        {
            activeDto = AttendanceRecordDto.FromEntity(activeRecord);
        }
        else
        {
            var todayLatest = await _context.AttendanceRecords
                .Include(a => a.WorkLocation)
                .Include(a => a.WorkShift)
                .Include(a => a.Employee)
                .Where(a => a.EmployeeId == employee.Id && a.Date == todayDate)
                .OrderByDescending(a => a.CheckInTimeUtc)
                .FirstOrDefaultAsync(cancellationToken);

            if (todayLatest != null)
            {
                activeDto = AttendanceRecordDto.FromEntity(todayLatest);
            }
        }

        // 2. Resolve shift for today
        var shiftResolution = await _shiftResolutionService.ResolveShiftForCheckInAsync(employee, utcNow, cancellationToken);

        // 3. Location info
        var location = employee.WorkLocation;
        if (location == null && employee.WorkLocationId.HasValue)
        {
            location = await _context.WorkLocations.FirstOrDefaultAsync(l => l.Id == employee.WorkLocationId.Value, cancellationToken);
        }

        // 4. Today's aggregate totals
        var todayRecords = await _context.AttendanceRecords
            .Where(a => a.EmployeeId == employee.Id && a.Date == todayDate)
            .ToListAsync(cancellationToken);

        var totalSessionsToday = todayRecords.Count;
        var totalMinutesToday = todayRecords.Sum(r => r.DurationMinutes ?? 0);

        // 5. Check if employee is currently on approved leave
        var approvedLeave = await _context.LeaveRequests
            .Include(l => l.LeaveType)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.EmployeeId == employee.Id &&
                                      l.Status == Domain.Enums.LeaveRequestStatus.Approved &&
                                      l.StartDate <= todayDate && l.EndDate >= todayDate,
                                 cancellationToken);

        var result = new CurrentAttendanceStatusDto
        {
            IsCheckedIn = activeRecord != null,
            ActiveAttendance = activeDto,

            HasAssignedLocation = location != null,
            AssignedLocationId = location?.Id,
            AssignedLocationName = location?.Name,
            AssignedLocationNameAr = location?.NameAr,
            AssignedLatitude = location?.Latitude,
            AssignedLongitude = location?.Longitude,
            AssignedRadiusMeters = location?.RadiusMeters,
            AssignedAccuracyThresholdMeters = location?.AccuracyThresholdMeters,

            HasScheduledShift = shiftResolution.Shift != null,
            TodayShift = shiftResolution.Shift != null ? WorkShiftDto.FromEntity(shiftResolution.Shift) : null,
            IsScheduledWorkDay = shiftResolution.IsScheduledWorkDay,
            ShiftNotice = approvedLeave != null
                ? $"Employee is on approved leave: {approvedLeave.LeaveType?.Name ?? "Leave"}"
                : shiftResolution.NoticeMessage,

            IsOnApprovedLeave = approvedLeave != null,
            ApprovedLeaveTypeName = approvedLeave?.LeaveType?.Name,
            ApprovedLeaveTypeNameAr = approvedLeave?.LeaveType?.NameAr,
            ApprovedLeaveStartDate = approvedLeave?.StartDate,
            ApprovedLeaveEndDate = approvedLeave?.EndDate,

            TotalSessionsToday = totalSessionsToday,
            TotalHoursToday = Math.Round(totalMinutesToday / 60.0, 2)
        };

        return GenericBaseResponse<CurrentAttendanceStatusDto>.Success(result);
    }
}
