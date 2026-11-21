using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Features.Reports.DTOs;
using Domain.Authorization;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reports.Queries.ExecuteReport;

public sealed class ExecuteReportHandler : IRequestHandler<ExecuteReportQuery, GenericBaseResponse<ReportResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ExecuteReportHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<ReportResultDto>> Handle(
        ExecuteReportQuery request,
        CancellationToken cancellationToken)
    {
        var filter = request.Filter;
        var allowedEmployeeIds = await ResolveSupervisorScopingAsync(cancellationToken);

        ReportResultDto result = filter.ReportId.ToLowerInvariant() switch
        {
            "daily-attendance" => await GenerateDailyAttendanceReportAsync(filter, allowedEmployeeIds, cancellationToken),
            "monthly-attendance" => await GenerateMonthlyAttendanceReportAsync(filter, allowedEmployeeIds, cancellationToken),
            "lateness-absence" => await GenerateLatenessAbsenceReportAsync(filter, allowedEmployeeIds, cancellationToken),
            "points-penalties" => await GeneratePointsPenaltiesReportAsync(filter, allowedEmployeeIds, cancellationToken),
            "disciplinary-summary" => await GenerateDisciplinarySummaryReportAsync(filter, allowedEmployeeIds, cancellationToken),
            "employee-operational" => await GenerateEmployeeOperationalReportAsync(filter, allowedEmployeeIds, cancellationToken),
            "leave-report" => await GenerateLeaveReportAsync(filter, allowedEmployeeIds, cancellationToken),
            "rewards-claims" => GenerateDeferredRewardsReport(filter),
            _ => throw new ArgumentException($"Unknown report ID: '{filter.ReportId}'")
        };

        return GenericBaseResponse<ReportResultDto>.Success(result);
    }

    private async Task<List<Guid>?> ResolveSupervisorScopingAsync(CancellationToken cancellationToken)
    {
        var isSupervisor = _currentUser.Roles.Contains(RoleNames.Supervisor);
        var isAdmin = _currentUser.Roles.Contains(RoleNames.Admin) || _currentUser.Roles.Contains(RoleNames.SuperAdmin);

        if (!isSupervisor || isAdmin) return null;

        var currentUserId = _currentUser.UserId;
        var currentEmployee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == currentUserId, cancellationToken);

        if (currentEmployee == null) return [];

        return await _context.Employees
            .AsNoTracking()
            .Where(e => e.SupervisorId == currentEmployee.Id || e.Id == currentEmployee.Id)
            .Select(e => e.Id)
            .ToListAsync(cancellationToken);
    }

    // 1. Daily Attendance Report
    private async Task<ReportResultDto> GenerateDailyAttendanceReportAsync(
        ReportFilterRequest filter,
        List<Guid>? allowedEmployeeIds,
        CancellationToken cancellationToken)
    {
        var targetDate = (filter.FromDate ?? DateTime.UtcNow).Date;
        var targetDateOnly = DateOnly.FromDateTime(targetDate);
        var isArabic = string.Equals(filter.Language, "ar", StringComparison.OrdinalIgnoreCase);

        var query = _context.AttendanceRecords
            .AsNoTracking()
            .Include(a => a.Employee)
            .Include(a => a.WorkLocation)
            .Include(a => a.WorkShift)
            .Where(a => a.Date == targetDateOnly || a.CheckInTimeUtc.Date == targetDate);

        if (allowedEmployeeIds != null)
            query = query.Where(a => allowedEmployeeIds.Contains(a.EmployeeId));

        if (filter.EmployeeId.HasValue || filter.EntityId.HasValue)
        {
            var empId = filter.EmployeeId ?? filter.EntityId!.Value;
            query = query.Where(a => a.EmployeeId == empId);
        }

        if (filter.WorkLocationId.HasValue)
            query = query.Where(a => a.WorkLocationId == filter.WorkLocationId.Value);

        if (filter.WorkShiftId.HasValue)
            query = query.Where(a => a.WorkShiftId == filter.WorkShiftId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Status) && Enum.TryParse<AttendanceStatus>(filter.Status, true, out var statusEnum))
            query = query.Where(a => a.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(a => a.Employee != null && (
                a.Employee.FirstName.ToLower().Contains(term) ||
                a.Employee.LastName.ToLower().Contains(term) ||
                a.Employee.EmployeeCode.ToLower().Contains(term)));
        }

        var records = await query
            .OrderBy(a => a.Employee != null ? a.Employee.EmployeeCode : "")
            .ThenBy(a => a.CheckInTimeUtc)
            .ToListAsync(cancellationToken);

        // Fetch approved leave requests covering target date to exempt and reflect authorized leaves
        var leaveQuery = _context.LeaveRequests
            .AsNoTracking()
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => l.Status == LeaveRequestStatus.Approved &&
                        l.StartDate <= targetDateOnly && l.EndDate >= targetDateOnly);

        if (allowedEmployeeIds != null)
            leaveQuery = leaveQuery.Where(l => allowedEmployeeIds.Contains(l.EmployeeId));

        if (filter.EmployeeId.HasValue || filter.EntityId.HasValue)
        {
            var empId = filter.EmployeeId ?? filter.EntityId!.Value;
            leaveQuery = leaveQuery.Where(l => l.EmployeeId == empId);
        }

        if (!string.IsNullOrWhiteSpace(filter.Department))
            leaveQuery = leaveQuery.Where(l => l.Employee != null && l.Employee.Department == filter.Department);

        var approvedLeaves = await leaveQuery.ToListAsync(cancellationToken);
        var attendedEmployeeIds = records.Select(r => r.EmployeeId).ToHashSet();

        // For employees on approved leave who did not check in, add excused leave entries
        var excusedLeaveRows = approvedLeaves
            .Where(l => !attendedEmployeeIds.Contains(l.EmployeeId))
            .Select(l =>
            {
                var leaveTypeName = isArabic
                    ? (l.LeaveType?.NameAr ?? l.LeaveType?.Name ?? "إجازة معتمدة")
                    : (l.LeaveType?.Name ?? "Approved Leave");

                var empName = l.Employee != null
                    ? (isArabic && !string.IsNullOrWhiteSpace(l.Employee.FullNameAr) ? l.Employee.FullNameAr : $"{l.Employee.FirstName} {l.Employee.LastName}".Trim())
                    : "—";

                var dept = (isArabic && !string.IsNullOrWhiteSpace(l.Employee?.DepartmentAr) ? l.Employee?.DepartmentAr : l.Employee?.Department) ?? "—";

                return new Dictionary<string, object?>
                {
                    ["employeeCode"] = l.Employee?.EmployeeCode ?? "—",
                    ["employeeName"] = empName,
                    ["department"] = dept,
                    ["workLocation"] = "—",
                    ["workShift"] = "—",
                    ["scheduledTime"] = "—",
                    ["checkInTime"] = "—",
                    ["checkOutTime"] = "—",
                    ["verification"] = isArabic ? "معفى (إجازة)" : "Excused (Leave)",
                    ["classification"] = leaveTypeName,
                    ["status"] = isArabic ? "إجازة معتمدة" : "ApprovedLeave",
                    ["durationHours"] = 0.0
                };
            }).Cast<IDictionary<string, object?>>().ToList();

        var columns = new List<ReportColumnDto>
        {
            new() { Key = "employeeCode", LabelEn = "Code", LabelAr = "الكود", Type = "string" },
            new() { Key = "employeeName", LabelEn = "Employee Name", LabelAr = "اسم الموظف", Type = "string" },
            new() { Key = "department", LabelEn = "Department", LabelAr = "القسم", Type = "string" },
            new() { Key = "workLocation", LabelEn = "Work Location", LabelAr = "موقع العمل", Type = "string" },
            new() { Key = "workShift", LabelEn = "Shift", LabelAr = "الوردية", Type = "string" },
            new() { Key = "scheduledTime", LabelEn = "Scheduled", LabelAr = "الموعد المجدول", Type = "string" },
            new() { Key = "checkInTime", LabelEn = "Check-In", LabelAr = "الحضور الفعلي", Type = "string" },
            new() { Key = "checkOutTime", LabelEn = "Check-Out", LabelAr = "الانصراف الفعلي", Type = "string" },
            new() { Key = "verification", LabelEn = "GPS Verification", LabelAr = "التحقق الجغرافي", Type = "badge", Align = "center" },
            new() { Key = "classification", LabelEn = "Arrival Type", LabelAr = "تصنيف الوصول", Type = "badge", Align = "center" },
            new() { Key = "status", LabelEn = "Status", LabelAr = "الحالة", Type = "badge", Align = "center" },
            new() { Key = "durationHours", LabelEn = "Hours", LabelAr = "الساعات", Type = "number", Align = "right" }
        };

        var rows = records.Select(r =>
        {
            var hours = r.DurationMinutes.HasValue ? Math.Round((double)r.DurationMinutes.Value / 60.0, 1) : 0.0;
            var empName = r.Employee != null
                ? (isArabic && !string.IsNullOrWhiteSpace(r.Employee.FullNameAr) ? r.Employee.FullNameAr : $"{r.Employee.FirstName} {r.Employee.LastName}".Trim())
                : "—";
            var dept = (isArabic && !string.IsNullOrWhiteSpace(r.Employee?.DepartmentAr) ? r.Employee?.DepartmentAr : r.Employee?.Department) ?? "—";
            var loc = (isArabic && !string.IsNullOrWhiteSpace(r.WorkLocation?.NameAr) ? r.WorkLocation?.NameAr : r.WorkLocation?.Name) ?? "—";
            var shift = (isArabic && !string.IsNullOrWhiteSpace(r.WorkShift?.NameAr) ? r.WorkShift?.NameAr : r.WorkShift?.Name) ?? "—";

            return new Dictionary<string, object?>
            {
                ["employeeCode"] = r.Employee?.EmployeeCode ?? "—",
                ["employeeName"] = empName,
                ["department"] = dept,
                ["workLocation"] = loc,
                ["workShift"] = shift,
                ["scheduledTime"] = r.WorkShift != null ? $"{r.WorkShift.StartTime:hh\\:mm} - {r.WorkShift.EndTime:hh\\:mm}" : "—",
                ["checkInTime"] = r.CheckInTimeUtc.ToString("yyyy-MM-dd HH:mm"),
                ["checkOutTime"] = r.CheckOutTimeUtc?.ToString("yyyy-MM-dd HH:mm") ?? "—",
                ["verification"] = r.CheckInStatus.ToString(),
                ["classification"] = r.ArrivalClassification.ToString(),
                ["status"] = r.Status.ToString(),
                ["durationHours"] = hours
            };
        }).Cast<IDictionary<string, object?>>().Concat(excusedLeaveRows).ToList();

        var totalMinutes = records.Where(r => r.DurationMinutes.HasValue).Sum(r => r.DurationMinutes!.Value);
        var totalHours = Math.Round((decimal)totalMinutes / 60m, 1);

        var kpis = new List<ReportSummaryKpiDto>
        {
            new() { Key = "total_records", LabelEn = "Total Attendance", LabelAr = "إجمالي الحضور", Value = records.Count, Type = "number" },
            new() { Key = "verified_records", LabelEn = "Verified (GPS)", LabelAr = "معتمد جغرافياً", Value = records.Count(r => r.CheckInStatus == VerificationStatus.Verified), Type = "number" },
            new() { Key = "pending_review", LabelEn = "Pending Review", LabelAr = "قيد المراجعة", Value = records.Count(r => r.CheckInStatus == VerificationStatus.PendingReview || r.CheckOutStatus == VerificationStatus.PendingReview), Type = "number" },
            new() { Key = "incomplete", LabelEn = "Missing Check-Out", LabelAr = "انصراف مفقود", Value = records.Count(r => r.CheckOutTimeUtc == null), Type = "number" },
            new() { Key = "approved_leaves", LabelEn = "Approved Leaves", LabelAr = "إجازات معتمدة", Value = approvedLeaves.Count, Type = "number" },
            new() { Key = "total_hours", LabelEn = "Total Hours", LabelAr = "إجمالي الساعات", Value = totalHours, Type = "number" }
        };

        return new ReportResultDto
        {
            ReportId = "daily-attendance",
            ReportNameEn = "Daily Attendance Report",
            ReportNameAr = "تقرير الحضور والانصراف اليومي",
            TotalRecords = rows.Count,
            Columns = columns,
            Rows = rows,
            SummaryKpis = kpis
        };
    }

    // 2. Monthly Attendance Report
    private async Task<ReportResultDto> GenerateMonthlyAttendanceReportAsync(
        ReportFilterRequest filter,
        List<Guid>? allowedEmployeeIds,
        CancellationToken cancellationToken)
    {
        var fromDate = (filter.FromDate ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1)).Date;
        var toDate = (filter.ToDate ?? DateTime.UtcNow).Date.AddDays(1).AddTicks(-1);

        var fromDateOnly = DateOnly.FromDateTime(fromDate);
        var toDateOnly = DateOnly.FromDateTime(toDate);

        var query = _context.AttendanceRecords
            .AsNoTracking()
            .Include(a => a.Employee)
            .Where(a => a.CheckInTimeUtc >= fromDate && a.CheckInTimeUtc <= toDate);

        if (allowedEmployeeIds != null)
            query = query.Where(a => allowedEmployeeIds.Contains(a.EmployeeId));

        if (filter.EmployeeId.HasValue || filter.EntityId.HasValue)
        {
            var empId = filter.EmployeeId ?? filter.EntityId!.Value;
            query = query.Where(a => a.EmployeeId == empId);
        }

        if (filter.WorkLocationId.HasValue)
            query = query.Where(a => a.WorkLocationId == filter.WorkLocationId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Department))
            query = query.Where(a => a.Employee != null && a.Employee.Department == filter.Department);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(a => a.Employee != null && (
                a.Employee.FirstName.ToLower().Contains(term) ||
                a.Employee.LastName.ToLower().Contains(term) ||
                a.Employee.EmployeeCode.ToLower().Contains(term)));
        }

        var records = await query.ToListAsync(cancellationToken);

        // Fetch leaves in date range
        var leaves = await _context.LeaveRequests
            .AsNoTracking()
            .Where(l => l.Status == LeaveRequestStatus.Approved &&
                        l.StartDate <= toDateOnly && l.EndDate >= fromDateOnly)
            .ToListAsync(cancellationToken);

        var grouped = records.GroupBy(r => r.EmployeeId).ToList();

        var columns = new List<ReportColumnDto>
        {
            new() { Key = "employeeCode", LabelEn = "Code", LabelAr = "الكود", Type = "string" },
            new() { Key = "employeeName", LabelEn = "Employee Name", LabelAr = "اسم الموظف", Type = "string" },
            new() { Key = "department", LabelEn = "Department", LabelAr = "القسم", Type = "string" },
            new() { Key = "attendedDays", LabelEn = "Attended Days", LabelAr = "أيام الحضور", Type = "number", Align = "right" },
            new() { Key = "completedShifts", LabelEn = "Completed Shifts", LabelAr = "ورديات مكتملة", Type = "number", Align = "right" },
            new() { Key = "onTimeCount", LabelEn = "On-Time", LabelAr = "في الموعد", Type = "number", Align = "right" },
            new() { Key = "lateCount", LabelEn = "Late Arrivals", LabelAr = "تأخيرات", Type = "number", Align = "right" },
            new() { Key = "afterCutoffCount", LabelEn = "After Cutoff (Black Card)", LabelAr = "بعد المهلة (بطاقة سوداء)", Type = "number", Align = "right" },
            new() { Key = "missingCheckOutCount", LabelEn = "Missing Check-Out", LabelAr = "انصراف مفقود", Type = "number", Align = "right" },
            new() { Key = "approvedLeaveDays", LabelEn = "Leave Days", LabelAr = "أيام الإجازة", Type = "number", Align = "right" },
            new() { Key = "totalHours", LabelEn = "Total Hours", LabelAr = "إجمالي الساعات", Type = "number", Align = "right" }
        };

        var rows = new List<IDictionary<string, object?>>();

        foreach (var group in grouped.OrderBy(g => g.First().Employee?.EmployeeCode))
        {
            var first = group.First();
            var empId = group.Key;
            var empLeaves = leaves.Where(l => l.EmployeeId == empId).Sum(l => l.DaysCount);
            var groupMinutes = group.Where(r => r.DurationMinutes.HasValue).Sum(r => r.DurationMinutes!.Value);
            var groupHours = Math.Round((double)groupMinutes / 60.0, 1);

            rows.Add(new Dictionary<string, object?>
            {
                ["employeeCode"] = first.Employee?.EmployeeCode ?? "—",
                ["employeeName"] = first.Employee != null ? $"{first.Employee.FirstName} {first.Employee.LastName}".Trim() : "—",
                ["department"] = first.Employee?.Department ?? "—",
                ["attendedDays"] = group.Select(r => r.Date).Distinct().Count(),
                ["completedShifts"] = group.Count(r => r.Status == AttendanceStatus.Completed),
                ["onTimeCount"] = group.Count(r => r.ArrivalClassification == ArrivalClassification.OnTime),
                ["lateCount"] = group.Count(r => r.ArrivalClassification == ArrivalClassification.Late),
                ["afterCutoffCount"] = group.Count(r => r.ArrivalClassification == ArrivalClassification.AfterCutoff),
                ["missingCheckOutCount"] = group.Count(r => r.CheckOutTimeUtc == null),
                ["approvedLeaveDays"] = empLeaves,
                ["totalHours"] = groupHours
            });
        }

        var totalAllMinutes = records.Where(r => r.DurationMinutes.HasValue).Sum(r => r.DurationMinutes!.Value);
        var totalAllHours = Math.Round((decimal)totalAllMinutes / 60m, 1);

        var kpis = new List<ReportSummaryKpiDto>
        {
            new() { Key = "total_employees", LabelEn = "Active Employees", LabelAr = "إجمالي الموظفين", Value = grouped.Count, Type = "number" },
            new() { Key = "total_shifts", LabelEn = "Total Sessions", LabelAr = "إجمالي الجلسات", Value = records.Count, Type = "number" },
            new() { Key = "total_hours", LabelEn = "Total Hours Logged", LabelAr = "إجمالي الساعات المسجلة", Value = totalAllHours, Type = "number" },
            new() { Key = "total_late", LabelEn = "Total Late Incidents", LabelAr = "إجمالي التأخيرات", Value = records.Count(r => r.ArrivalClassification == ArrivalClassification.Late || r.ArrivalClassification == ArrivalClassification.AfterCutoff), Type = "number" }
        };

        return new ReportResultDto
        {
            ReportId = "monthly-attendance",
            ReportNameEn = "Monthly Attendance & Timesheet",
            ReportNameAr = "تقرير الحضور الشهري وساعات العمل",
            TotalRecords = rows.Count,
            Columns = columns,
            Rows = rows,
            SummaryKpis = kpis
        };
    }

    // 3. Lateness & Absence Report
    private async Task<ReportResultDto> GenerateLatenessAbsenceReportAsync(
        ReportFilterRequest filter,
        List<Guid>? allowedEmployeeIds,
        CancellationToken cancellationToken)
    {
        var fromDate = (filter.FromDate ?? DateTime.UtcNow.AddDays(-30)).Date;
        var toDate = (filter.ToDate ?? DateTime.UtcNow).Date.AddDays(1).AddTicks(-1);
        var fromDateOnly = DateOnly.FromDateTime(fromDate);
        var toDateOnly = DateOnly.FromDateTime(toDate);
        var isArabic = string.Equals(filter.Language, "ar", StringComparison.OrdinalIgnoreCase);

        var query = _context.AttendanceRecords
            .AsNoTracking()
            .Include(a => a.Employee)
            .Include(a => a.WorkShift)
            .Where(a => a.CheckInTimeUtc >= fromDate && a.CheckInTimeUtc <= toDate &&
                        (a.ArrivalClassification == ArrivalClassification.Late ||
                         a.ArrivalClassification == ArrivalClassification.AfterCutoff ||
                         a.CheckOutTimeUtc == null ||
                         a.CheckInStatus == VerificationStatus.PendingReview ||
                         a.Status == AttendanceStatus.Rejected));

        if (allowedEmployeeIds != null)
            query = query.Where(a => allowedEmployeeIds.Contains(a.EmployeeId));

        if (filter.EmployeeId.HasValue || filter.EntityId.HasValue)
        {
            var empId = filter.EmployeeId ?? filter.EntityId!.Value;
            query = query.Where(a => a.EmployeeId == empId);
        }

        if (filter.WorkLocationId.HasValue)
            query = query.Where(a => a.WorkLocationId == filter.WorkLocationId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Department))
            query = query.Where(a => a.Employee != null && a.Employee.Department == filter.Department);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(a => a.Employee != null && (
                a.Employee.FirstName.ToLower().Contains(term) ||
                a.Employee.LastName.ToLower().Contains(term) ||
                a.Employee.EmployeeCode.ToLower().Contains(term)));
        }

        var rawRecords = await query
            .OrderByDescending(a => a.CheckInTimeUtc)
            .ToListAsync(cancellationToken);

        // Fetch approved leave requests to exempt employees on authorized leaves from absence/exception flags
        var approvedLeaves = await _context.LeaveRequests
            .AsNoTracking()
            .Where(l => l.Status == LeaveRequestStatus.Approved &&
                        l.StartDate <= toDateOnly && l.EndDate >= fromDateOnly)
            .ToListAsync(cancellationToken);

        // Employees on approved leave on that date are exempt
        var records = rawRecords
            .Where(r => !approvedLeaves.Any(l => l.EmployeeId == r.EmployeeId && l.StartDate <= r.Date && l.EndDate >= r.Date))
            .ToList();

        var columns = new List<ReportColumnDto>
        {
            new() { Key = "date", LabelEn = "Date", LabelAr = "التاريخ", Type = "date", Align = "center" },
            new() { Key = "employeeCode", LabelEn = "Code", LabelAr = "الكود", Type = "string" },
            new() { Key = "employeeName", LabelEn = "Employee Name", LabelAr = "اسم الموظف", Type = "string" },
            new() { Key = "department", LabelEn = "Department", LabelAr = "القسم", Type = "string" },
            new() { Key = "workShift", LabelEn = "Shift", LabelAr = "الوردية", Type = "string" },
            new() { Key = "scheduledStart", LabelEn = "Shift Start", LabelAr = "بداية الوردية", Type = "string", Align = "center" },
            new() { Key = "actualCheckIn", LabelEn = "Actual Check-In", LabelAr = "الحضور الفعلي", Type = "string", Align = "center" },
            new() { Key = "exceptionType", LabelEn = "Exception Type", LabelAr = "نوع الاستثناء", Type = "badge", Align = "center" },
            new() { Key = "policyMarker", LabelEn = "Policy Action (DEC)", LabelAr = "الإجراء المعتمد", Type = "string" },
            new() { Key = "notes", LabelEn = "Reason / Notes", LabelAr = "الملاحظات والسبب", Type = "string" }
        };

        var rows = records.Select(r =>
        {
            string exceptionType;
            string policyMarker;

            if (r.ArrivalClassification == ArrivalClassification.AfterCutoff)
            {
                exceptionType = "AfterCutoff";
                policyMarker = isArabic ? "بطاقة سوداء مسندة (DEC-004)" : "Black Card Assigned (DEC-004)";
            }
            else if (r.ArrivalClassification == ArrivalClassification.Late)
            {
                exceptionType = "LateArrival";
                policyMarker = isArabic ? "تجاوز فترة السماح" : "Grace Period Exceeded";
            }
            else if (r.CheckOutTimeUtc == null)
            {
                exceptionType = "MissingCheckOut";
                policyMarker = isArabic ? "جلسة غير مكتملة (DEC-005)" : "Incomplete Shift (DEC-005)";
            }
            else if (r.CheckInStatus == VerificationStatus.PendingReview)
            {
                exceptionType = "PendingReview";
                policyMarker = isArabic ? "استثناء سياج جغرافي (DEC-006)" : "GPS Breach (DEC-006)";
            }
            else
            {
                exceptionType = r.Status.ToString();
                policyMarker = isArabic ? "مراجعة إدارية" : "Administrative Review";
            }

            var empName = r.Employee != null
                ? (isArabic && !string.IsNullOrWhiteSpace(r.Employee.FullNameAr) ? r.Employee.FullNameAr : $"{r.Employee.FirstName} {r.Employee.LastName}".Trim())
                : "—";
            var dept = (isArabic && !string.IsNullOrWhiteSpace(r.Employee?.DepartmentAr) ? r.Employee?.DepartmentAr : r.Employee?.Department) ?? "—";
            var shift = (isArabic && !string.IsNullOrWhiteSpace(r.WorkShift?.NameAr) ? r.WorkShift?.NameAr : r.WorkShift?.Name) ?? "—";

            return new Dictionary<string, object?>
            {
                ["date"] = r.Date.ToString("yyyy-MM-dd"),
                ["employeeCode"] = r.Employee?.EmployeeCode ?? "—",
                ["employeeName"] = empName,
                ["department"] = dept,
                ["workShift"] = shift,
                ["scheduledStart"] = r.WorkShift != null ? $"{r.WorkShift.StartTime:hh\\:mm}" : "—",
                ["actualCheckIn"] = r.CheckInTimeUtc.ToString("HH:mm"),
                ["exceptionType"] = exceptionType,
                ["policyMarker"] = policyMarker,
                ["notes"] = r.CheckInFailureReason ?? r.Notes ?? "—"
            };
        }).Cast<IDictionary<string, object?>>().ToList();

        var kpis = new List<ReportSummaryKpiDto>
        {
            new() { Key = "total_exceptions", LabelEn = "Total Exceptions", LabelAr = "إجمالي الاستثناءات", Value = records.Count, Type = "number" },
            new() { Key = "late_count", LabelEn = "Standard Late", LabelAr = "تأخير اعتيادي", Value = records.Count(r => r.ArrivalClassification == ArrivalClassification.Late), Type = "number" },
            new() { Key = "black_card_count", LabelEn = "Black Card (After Cutoff)", LabelAr = "بطاقة سوداء (بعد المهلة)", Value = records.Count(r => r.ArrivalClassification == ArrivalClassification.AfterCutoff), Type = "number" },
            new() { Key = "missing_checkout", LabelEn = "Missing Check-Out", LabelAr = "انصراف مفقود", Value = records.Count(r => r.CheckOutTimeUtc == null), Type = "number" }
        };

        return new ReportResultDto
        {
            ReportId = "lateness-absence",
            ReportNameEn = "Lateness & Absence Exceptions",
            ReportNameAr = "تقرير التأخيرات والغياب والاستثناءات",
            TotalRecords = rows.Count,
            Columns = columns,
            Rows = rows,
            SummaryKpis = kpis
        };
    }

    // 4. Points & Penalties Report
    private async Task<ReportResultDto> GeneratePointsPenaltiesReportAsync(
        ReportFilterRequest filter,
        List<Guid>? allowedEmployeeIds,
        CancellationToken cancellationToken)
    {
        var fromDate = (filter.FromDate ?? DateTime.UtcNow.AddDays(-30)).Date;
        var toDate = (filter.ToDate ?? DateTime.UtcNow).Date.AddDays(1).AddTicks(-1);

        var query = _context.PointTransactions
            .AsNoTracking()
            .Include(p => p.Employee)
            .Where(p => p.TimestampUtc >= fromDate && p.TimestampUtc <= toDate);

        if (allowedEmployeeIds != null)
            query = query.Where(p => allowedEmployeeIds.Contains(p.EmployeeId));

        if (filter.EmployeeId.HasValue || filter.EntityId.HasValue)
        {
            var empId = filter.EmployeeId ?? filter.EntityId!.Value;
            query = query.Where(p => p.EmployeeId == empId);
        }

        if (!string.IsNullOrWhiteSpace(filter.PointCategory) && Enum.TryParse<PointCategory>(filter.PointCategory, true, out var catEnum))
            query = query.Where(p => p.Category == catEnum);

        if (!string.IsNullOrWhiteSpace(filter.Status) && Enum.TryParse<PointTransactionStatus>(filter.Status, true, out var statusEnum))
            query = query.Where(p => p.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(p => p.Employee != null && (
                p.Employee.FirstName.ToLower().Contains(term) ||
                p.Employee.LastName.ToLower().Contains(term) ||
                p.Employee.EmployeeCode.ToLower().Contains(term) ||
                p.Reason.ToLower().Contains(term)));
        }

        var transactions = await query
            .OrderByDescending(p => p.TimestampUtc)
            .ToListAsync(cancellationToken);

        var columns = new List<ReportColumnDto>
        {
            new() { Key = "timestamp", LabelEn = "Timestamp", LabelAr = "التاريخ والوقت", Type = "date", Align = "center" },
            new() { Key = "employeeCode", LabelEn = "Code", LabelAr = "الكود", Type = "string" },
            new() { Key = "employeeName", LabelEn = "Employee Name", LabelAr = "اسم الموظف", Type = "string" },
            new() { Key = "category", LabelEn = "Category", LabelAr = "الفئة", Type = "badge", Align = "center" },
            new() { Key = "eventType", LabelEn = "Event Type", LabelAr = "نوع الحدث", Type = "string" },
            new() { Key = "points", LabelEn = "Points", LabelAr = "النقاط", Type = "number", Align = "right" },
            new() { Key = "status", LabelEn = "Status", LabelAr = "الحالة", Type = "badge", Align = "center" },
            new() { Key = "reason", LabelEn = "Reason", LabelAr = "السبب المدون", Type = "string" },
            new() { Key = "recordedBy", LabelEn = "Recorded By", LabelAr = "المسجل", Type = "string" }
        };

        var rows = transactions.Select(t => new Dictionary<string, object?>
        {
            ["timestamp"] = t.TimestampUtc.ToString("yyyy-MM-dd HH:mm"),
            ["employeeCode"] = t.Employee?.EmployeeCode ?? "—",
            ["employeeName"] = t.Employee != null ? $"{t.Employee.FirstName} {t.Employee.LastName}".Trim() : "—",
            ["category"] = t.Category.ToString(),
            ["eventType"] = t.EventType.ToString(),
            ["points"] = t.Points,
            ["status"] = t.Status.ToString(),
            ["reason"] = t.Reason,
            ["recordedBy"] = t.Created_By ?? "System Engine"
        }).Cast<IDictionary<string, object?>>().ToList();

        var kpis = new List<ReportSummaryKpiDto>
        {
            new() { Key = "green_points", LabelEn = "Total Green Points", LabelAr = "إجمالي النقاط الخضراء", Value = transactions.Where(t => t.Category == PointCategory.Green && t.Status == PointTransactionStatus.Finalized).Sum(t => t.Points), Type = "number" },
            new() { Key = "red_points", LabelEn = "Total Red Points", LabelAr = "إجمالي النقاط الحمراء", Value = Math.Abs(transactions.Where(t => t.Category == PointCategory.Red && t.Status == PointTransactionStatus.Finalized).Sum(t => t.Points)), Type = "number" },
            new() { Key = "black_points", LabelEn = "Total Black Points", LabelAr = "إجمالي النقاط السوداء", Value = Math.Abs(transactions.Where(t => t.Category == PointCategory.Black && t.Status == PointTransactionStatus.Finalized).Sum(t => t.Points)), Type = "number" },
            new() { Key = "total_transactions", LabelEn = "Transactions Count", LabelAr = "عدد الحركات", Value = transactions.Count, Type = "number" }
        };

        return new ReportResultDto
        {
            ReportId = "points-penalties",
            ReportNameEn = "Points & Penalties Ledger",
            ReportNameAr = "سجل النقاط والجزاءات التراكمي",
            TotalRecords = rows.Count,
            Columns = columns,
            Rows = rows,
            SummaryKpis = kpis
        };
    }

    // 5. Disciplinary Summary Report (Non-financial, strictly adhering to DEC-011 and DEC-012)
    private async Task<ReportResultDto> GenerateDisciplinarySummaryReportAsync(
        ReportFilterRequest filter,
        List<Guid>? allowedEmployeeIds,
        CancellationToken cancellationToken)
    {
        var fromDate = (filter.FromDate ?? DateTime.UtcNow.AddDays(-30)).Date;
        var toDate = (filter.ToDate ?? DateTime.UtcNow).Date.AddDays(1).AddTicks(-1);

        var query = _context.Employees
            .AsNoTracking()
            .Where(e => e.IsActive);

        if (allowedEmployeeIds != null)
            query = query.Where(e => allowedEmployeeIds.Contains(e.Id));

        if (filter.EmployeeId.HasValue || filter.EntityId.HasValue)
        {
            var empId = filter.EmployeeId ?? filter.EntityId!.Value;
            query = query.Where(e => e.Id == empId);
        }

        if (!string.IsNullOrWhiteSpace(filter.Department))
            query = query.Where(e => e.Department == filter.Department);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(e => e.FirstName.ToLower().Contains(term) ||
                                     e.LastName.ToLower().Contains(term) ||
                                     e.EmployeeCode.ToLower().Contains(term));
        }

        var employees = await query.ToListAsync(cancellationToken);
        var employeeIds = employees.Select(e => e.Id).ToList();

        // Query infraction events in date range
        var attendanceExceptions = await _context.AttendanceRecords
            .AsNoTracking()
            .Where(a => employeeIds.Contains(a.EmployeeId) &&
                        a.CheckInTimeUtc >= fromDate && a.CheckInTimeUtc <= toDate &&
                        (a.ArrivalClassification == ArrivalClassification.Late ||
                         a.ArrivalClassification == ArrivalClassification.AfterCutoff ||
                         a.CheckOutTimeUtc == null))
            .ToListAsync(cancellationToken);

        var penaltyTransactions = await _context.PointTransactions
            .AsNoTracking()
            .Where(p => employeeIds.Contains(p.EmployeeId) &&
                        p.TimestampUtc >= fromDate && p.TimestampUtc <= toDate &&
                        (p.Category == PointCategory.Red || p.Category == PointCategory.Black) &&
                        p.Status == PointTransactionStatus.Finalized)
            .ToListAsync(cancellationToken);

        var columns = new List<ReportColumnDto>
        {
            new() { Key = "employeeCode", LabelEn = "Code", LabelAr = "الكود", Type = "string" },
            new() { Key = "employeeName", LabelEn = "Employee Name", LabelAr = "اسم الموظف", Type = "string" },
            new() { Key = "department", LabelEn = "Department", LabelAr = "القسم", Type = "string" },
            new() { Key = "latenessCount", LabelEn = "Lateness Count", LabelAr = "مرات التأخير", Type = "number", Align = "right" },
            new() { Key = "blackCardCount", LabelEn = "Black Card Markers", LabelAr = "بطاقات سوداء (حضور)", Type = "number", Align = "right" },
            new() { Key = "missingCheckOuts", LabelEn = "Missing Check-Outs", LabelAr = "انصراف مفقود", Type = "number", Align = "right" },
            new() { Key = "redPoints", LabelEn = "Red Points (Deducted)", LabelAr = "نقاط حمراء", Type = "number", Align = "right" },
            new() { Key = "blackPoints", LabelEn = "Black Penalty Points", LabelAr = "نقاط سوداء", Type = "number", Align = "right" },
            new() { Key = "disciplinaryStatus", LabelEn = "Administrative Status", LabelAr = "الحالة الإدارية", Type = "badge", Align = "center" },
            new() { Key = "financialPolicyNotice", LabelEn = "Monetary Deduction Status", LabelAr = "حالة الخصم المالي", Type = "string" }
        };

        var rows = new List<IDictionary<string, object?>>();

        foreach (var emp in employees.OrderBy(e => e.EmployeeCode))
        {
            var empAtt = attendanceExceptions.Where(a => a.EmployeeId == emp.Id).ToList();
            var empPoints = penaltyTransactions.Where(p => p.EmployeeId == emp.Id).ToList();

            var lateCount = empAtt.Count(a => a.ArrivalClassification == ArrivalClassification.Late);
            var blackCardCount = empAtt.Count(a => a.ArrivalClassification == ArrivalClassification.AfterCutoff);
            var missingCheckouts = empAtt.Count(a => a.CheckOutTimeUtc == null);
            var redPoints = Math.Abs(empPoints.Where(p => p.Category == PointCategory.Red).Sum(p => p.Points));
            var blackPoints = Math.Abs(empPoints.Where(p => p.Category == PointCategory.Black).Sum(p => p.Points));

            if (lateCount == 0 && blackCardCount == 0 && missingCheckouts == 0 && redPoints == 0 && blackPoints == 0)
                continue; // Only report employees with disciplinary records

            string adminStatus = blackPoints > 0 || blackCardCount > 1 ? "Critical" : redPoints > 0 ? "Warning" : "Review";

            rows.Add(new Dictionary<string, object?>
            {
                ["employeeCode"] = emp.EmployeeCode,
                ["employeeName"] = $"{emp.FirstName} {emp.LastName}".Trim(),
                ["department"] = emp.Department ?? "—",
                ["latenessCount"] = lateCount,
                ["blackCardCount"] = blackCardCount,
                ["missingCheckOuts"] = missingCheckouts,
                ["redPoints"] = redPoints,
                ["blackPoints"] = blackPoints,
                ["disciplinaryStatus"] = adminStatus,
                ["financialPolicyNotice"] = "Pending Approval (DEC-011/DEC-012)"
            });
        }

        var kpis = new List<ReportSummaryKpiDto>
        {
            new() { Key = "employees_flagged", LabelEn = "Flagged Employees", LabelAr = "موظفون بمخالفات مسجلة", Value = rows.Count, Type = "number" },
            new() { Key = "total_red", LabelEn = "Total Red Points", LabelAr = "إجمالي النقاط الحمراء", Value = penaltyTransactions.Where(p => p.Category == PointCategory.Red).Sum(p => Math.Abs(p.Points)), Type = "number" },
            new() { Key = "total_black", LabelEn = "Total Black Points", LabelAr = "إجمالي النقاط السوداء", Value = penaltyTransactions.Where(p => p.Category == PointCategory.Black).Sum(p => Math.Abs(p.Points)), Type = "number" },
            new() { Key = "financial_policy_status", LabelEn = "Financial Deduction Approvals", LabelAr = "اعتمادات الخصم المالي", Value = 0, Type = "number" }
        };

        return new ReportResultDto
        {
            ReportId = "disciplinary-summary",
            ReportNameEn = "Disciplinary Summary (Non-Financial)",
            ReportNameAr = "الملخص التأديبي الإداري (غير المالي)",
            TotalRecords = rows.Count,
            Columns = columns,
            Rows = rows,
            SummaryKpis = kpis
        };
    }

    // 6. Employee Operational Directory
    private async Task<ReportResultDto> GenerateEmployeeOperationalReportAsync(
        ReportFilterRequest filter,
        List<Guid>? allowedEmployeeIds,
        CancellationToken cancellationToken)
    {
        var query = _context.Employees
            .AsNoTracking()
            .Include(e => e.Supervisor)
            .Include(e => e.WorkLocation)
            .AsQueryable();

        if (allowedEmployeeIds != null)
            query = query.Where(e => allowedEmployeeIds.Contains(e.Id));

        if (filter.WorkLocationId.HasValue)
            query = query.Where(e => e.WorkLocationId == filter.WorkLocationId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Department))
            query = query.Where(e => e.Department == filter.Department);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(e => e.FirstName.ToLower().Contains(term) ||
                                     e.LastName.ToLower().Contains(term) ||
                                     e.EmployeeCode.ToLower().Contains(term));
        }

        var employees = await query.OrderBy(e => e.EmployeeCode).ToListAsync(cancellationToken);
        var employeeIds = employees.Select(e => e.Id).ToList();

        // Get total attendance sessions and minutes
        var attendanceTotals = await _context.AttendanceRecords
            .AsNoTracking()
            .Where(a => employeeIds.Contains(a.EmployeeId))
            .GroupBy(a => a.EmployeeId)
            .Select(g => new
            {
                EmployeeId = g.Key,
                SessionCount = g.Count(),
                TotalMinutes = g.Where(a => a.DurationMinutes.HasValue).Sum(a => a.DurationMinutes!.Value)
            })
            .ToDictionaryAsync(x => x.EmployeeId, cancellationToken);

        // Get leaves
        var leaveTotals = await _context.LeaveRequests
            .AsNoTracking()
            .Where(l => employeeIds.Contains(l.EmployeeId) && l.Status == LeaveRequestStatus.Approved)
            .GroupBy(l => l.EmployeeId)
            .Select(g => new { EmployeeId = g.Key, Days = g.Sum(l => l.DaysCount) })
            .ToDictionaryAsync(x => x.EmployeeId, cancellationToken);

        // Get points
        var pointsTotals = await _context.PointTransactions
            .AsNoTracking()
            .Where(p => employeeIds.Contains(p.EmployeeId) && p.Status == PointTransactionStatus.Finalized)
            .GroupBy(p => p.EmployeeId)
            .Select(g => new
            {
                EmployeeId = g.Key,
                NetPoints = g.Where(p => p.Category == PointCategory.Green).Sum(p => p.Points) +
                            g.Where(p => p.Category != PointCategory.Green).Sum(p => p.Points)
            })
            .ToDictionaryAsync(x => x.EmployeeId, cancellationToken);

        var columns = new List<ReportColumnDto>
        {
            new() { Key = "employeeCode", LabelEn = "Code", LabelAr = "الكود", Type = "string" },
            new() { Key = "fullName", LabelEn = "Full Name", LabelAr = "الاسم الكامل", Type = "string" },
            new() { Key = "department", LabelEn = "Department", LabelAr = "القسم", Type = "string" },
            new() { Key = "jobTitle", LabelEn = "Job Title", LabelAr = "المسمى الوظيفي", Type = "string" },
            new() { Key = "supervisor", LabelEn = "Supervisor", LabelAr = "المشرف المباشر", Type = "string" },
            new() { Key = "location", LabelEn = "Work Location", LabelAr = "موقع العمل", Type = "string" },
            new() { Key = "totalSessions", LabelEn = "Sessions", LabelAr = "جلسات الحضور", Type = "number", Align = "right" },
            new() { Key = "totalHours", LabelEn = "Total Hours", LabelAr = "إجمالي الساعات", Type = "number", Align = "right" },
            new() { Key = "approvedLeaves", LabelEn = "Leave Days", LabelAr = "أيام الإجازة", Type = "number", Align = "right" },
            new() { Key = "netPoints", LabelEn = "Net Points", LabelAr = "صافي النقاط", Type = "number", Align = "right" },
            new() { Key = "status", LabelEn = "Status", LabelAr = "الحالة", Type = "badge", Align = "center" }
        };

        var rows = employees.Select(e =>
        {
            attendanceTotals.TryGetValue(e.Id, out var att);
            leaveTotals.TryGetValue(e.Id, out var leave);
            pointsTotals.TryGetValue(e.Id, out var pt);

            var hours = att != null ? Math.Round((double)att.TotalMinutes / 60.0, 1) : 0.0;

            return new Dictionary<string, object?>
            {
                ["employeeCode"] = e.EmployeeCode,
                ["fullName"] = $"{e.FirstName} {e.LastName}".Trim(),
                ["department"] = e.Department ?? "—",
                ["jobTitle"] = e.JobTitle ?? "—",
                ["supervisor"] = e.Supervisor != null ? $"{e.Supervisor.FirstName} {e.Supervisor.LastName}".Trim() : "—",
                ["location"] = e.WorkLocation?.Name ?? "—",
                ["totalSessions"] = att?.SessionCount ?? 0,
                ["totalHours"] = hours,
                ["approvedLeaves"] = leave?.Days ?? 0,
                ["netPoints"] = pt?.NetPoints ?? 0,
                ["status"] = e.IsActive ? "Active" : "Inactive"
            };
        }).Cast<IDictionary<string, object?>>().ToList();

        var grandTotalMinutes = attendanceTotals.Values.Sum(a => a.TotalMinutes);
        var grandTotalHours = Math.Round((decimal)grandTotalMinutes / 60m, 1);

        var kpis = new List<ReportSummaryKpiDto>
        {
            new() { Key = "total_workforce", LabelEn = "Total Workforce", LabelAr = "إجمالي القوى العاملة", Value = employees.Count, Type = "number" },
            new() { Key = "active_count", LabelEn = "Active Staff", LabelAr = "الموظفون النشطون", Value = employees.Count(e => e.IsActive), Type = "number" },
            new() { Key = "total_hours", LabelEn = "Total Hours Logged", LabelAr = "إجمالي الساعات المجمعة", Value = grandTotalHours, Type = "number" },
            new() { Key = "avg_net_points", LabelEn = "Avg Net Points", LabelAr = "متوسط رصيد النقاط", Value = pointsTotals.Count > 0 ? (decimal)Math.Round(pointsTotals.Values.Average(p => p.NetPoints), 1) : 0, Type = "number" }
        };

        return new ReportResultDto
        {
            ReportId = "employee-operational",
            ReportNameEn = "Employee Operational Directory",
            ReportNameAr = "السجل التشغيلي الشامل للموظفين",
            TotalRecords = rows.Count,
            Columns = columns,
            Rows = rows,
            SummaryKpis = kpis
        };
    }

    // 7. Leave Report
    private async Task<ReportResultDto> GenerateLeaveReportAsync(
        ReportFilterRequest filter,
        List<Guid>? allowedEmployeeIds,
        CancellationToken cancellationToken)
    {
        var fromDate = (filter.FromDate ?? DateTime.UtcNow.AddDays(-60)).Date;
        var toDate = (filter.ToDate ?? DateTime.UtcNow).Date.AddDays(1).AddTicks(-1);

        var fromDateOnly = DateOnly.FromDateTime(fromDate);
        var toDateOnly = DateOnly.FromDateTime(toDate);

        var query = _context.LeaveRequests
            .AsNoTracking()
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => l.StartDate <= toDateOnly && l.EndDate >= fromDateOnly);

        if (allowedEmployeeIds != null)
            query = query.Where(l => allowedEmployeeIds.Contains(l.EmployeeId));

        if (filter.EmployeeId.HasValue || filter.EntityId.HasValue)
        {
            var empId = filter.EmployeeId ?? filter.EntityId!.Value;
            query = query.Where(l => l.EmployeeId == empId);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status) && Enum.TryParse<LeaveRequestStatus>(filter.Status, true, out var statusEnum))
            query = query.Where(l => l.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(filter.Department))
            query = query.Where(l => l.Employee != null && l.Employee.Department == filter.Department);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(l => l.Employee != null && (
                l.Employee.FirstName.ToLower().Contains(term) ||
                l.Employee.LastName.ToLower().Contains(term) ||
                l.Employee.EmployeeCode.ToLower().Contains(term)));
        }

        var requests = await query
            .OrderByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);

        var columns = new List<ReportColumnDto>
        {
            new() { Key = "requestId", LabelEn = "Request #", LabelAr = "رقم الطلب", Type = "string" },
            new() { Key = "employeeCode", LabelEn = "Code", LabelAr = "الكود", Type = "string" },
            new() { Key = "employeeName", LabelEn = "Employee Name", LabelAr = "اسم الموظف", Type = "string" },
            new() { Key = "department", LabelEn = "Department", LabelAr = "القسم", Type = "string" },
            new() { Key = "leaveType", LabelEn = "Leave Type", LabelAr = "نوع الإجازة", Type = "string" },
            new() { Key = "startDate", LabelEn = "Start Date", LabelAr = "تاريخ البداية", Type = "date", Align = "center" },
            new() { Key = "endDate", LabelEn = "End Date", LabelAr = "تاريخ النهاية", Type = "date", Align = "center" },
            new() { Key = "days", LabelEn = "Days", LabelAr = "الأيام", Type = "number", Align = "right" },
            new() { Key = "isPaid", LabelEn = "Paid", LabelAr = "مدفوعة", Type = "badge", Align = "center" },
            new() { Key = "status", LabelEn = "Status", LabelAr = "الحالة", Type = "badge", Align = "center" },
            new() { Key = "notes", LabelEn = "Notes / Reason", LabelAr = "الملاحظات", Type = "string" }
        };

        var rows = requests.Select(r => new Dictionary<string, object?>
        {
            ["requestId"] = r.Id.ToString()[..8].ToUpperInvariant(),
            ["employeeCode"] = r.Employee?.EmployeeCode ?? "—",
            ["employeeName"] = r.Employee != null ? $"{r.Employee.FirstName} {r.Employee.LastName}".Trim() : "—",
            ["department"] = r.Employee?.Department ?? "—",
            ["leaveType"] = r.LeaveType?.Name ?? "—",
            ["startDate"] = r.StartDate.ToString("yyyy-MM-dd"),
            ["endDate"] = r.EndDate.ToString("yyyy-MM-dd"),
            ["days"] = r.DaysCount,
            ["isPaid"] = r.LeaveType?.IsPaid == true ? "Paid" : "Unpaid",
            ["status"] = r.Status.ToString(),
            ["notes"] = r.ReviewNotes ?? r.Reason ?? "—"
        }).Cast<IDictionary<string, object?>>().ToList();

        var kpis = new List<ReportSummaryKpiDto>
        {
            new() { Key = "total_requests", LabelEn = "Total Requests", LabelAr = "إجمالي الطلبات", Value = requests.Count, Type = "number" },
            new() { Key = "approved_days", LabelEn = "Approved Leave Days", LabelAr = "أيام الإجازات المعتمدة", Value = requests.Where(r => r.Status == LeaveRequestStatus.Approved).Sum(r => r.DaysCount), Type = "number" },
            new() { Key = "pending_requests", LabelEn = "Pending Requests", LabelAr = "طلبات قيد المراجعة", Value = requests.Count(r => r.Status == LeaveRequestStatus.Pending), Type = "number" },
            new() { Key = "rejected_requests", LabelEn = "Rejected Requests", LabelAr = "طلبات مرفوضة", Value = requests.Count(r => r.Status == LeaveRequestStatus.Rejected), Type = "number" }
        };

        return new ReportResultDto
        {
            ReportId = "leave-report",
            ReportNameEn = "Leave Requests & Balances",
            ReportNameAr = "تقرير الإجازات والاستئذانات",
            TotalRecords = rows.Count,
            Columns = columns,
            Rows = rows,
            SummaryKpis = kpis
        };
    }

    // 8. Reward Claims Report (Deferred integration)
    private static ReportResultDto GenerateDeferredRewardsReport(ReportFilterRequest filter)
    {
        return new ReportResultDto
        {
            ReportId = "rewards-claims",
            ReportNameEn = "Reward Claims (Deferred Integration)",
            ReportNameAr = "مطالبات المكافآت النقدية (تكامل مؤجل)",
            TotalRecords = 0,
            Columns =
            [
                new() { Key = "claimId", LabelEn = "Claim ID", LabelAr = "رقم المطالبة", Type = "string" },
                new() { Key = "employeeName", LabelEn = "Employee", LabelAr = "الموظف", Type = "string" },
                new() { Key = "pointsReserved", LabelEn = "Points", LabelAr = "النقاط", Type = "number" },
                new() { Key = "status", LabelEn = "Status", LabelAr = "الحالة", Type = "badge" }
            ],
            Rows = [],
            SummaryKpis =
            [
                new() { Key = "status_deferred", LabelEn = "MOD-08 Integration Pending", LabelAr = "بانتظار اكتمال تكامل MOD-08", Value = 0, Type = "number" }
            ]
        };
    }
}
