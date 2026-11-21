using Application.Abstractions;
using Application.Features.AdminOperations.Commands.ApproveGpsException;
using Application.Features.AdminOperations.Commands.RejectGpsException;
using Application.Features.Attendance.DTOs;
using Application.Features.Attendance.Queries.GetCurrentAttendanceStatus;
using Application.Features.Reports.DTOs;
using Application.Features.Reports.Queries.ExecuteReport;
using Domain.Authorization;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Tests.Fakes;
using Xunit;

namespace Tests.Integration;

public class BusinessIntegrityStep02Tests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ShiftResolutionService _shiftResolutionService;
    private readonly PointCalculationEngine _pointEngine;

    public BusinessIntegrityStep02Tests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "BusinessIntegrityStep02_" + Guid.NewGuid().ToString("N"))
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _shiftResolutionService = new ShiftResolutionService(_dbContext);
        _pointEngine = new PointCalculationEngine(_dbContext);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task EarlyArrival_ClassifiedCorrectly_And_AwardsConfiguredGreenPoints()
    {
        // Arrange
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-EARLY01",
            FirstName = "Sami",
            LastName = "Al-Harbi",
            FirstNameAr = "سامي",
            LastNameAr = "الحربي",
            Email = "sami@nasaq.test",
            IsActive = true
        };
        _dbContext.Employees.Add(employee);

        var shift = new WorkShift
        {
            Id = Guid.NewGuid(),
            Name = "Morning Operational Shift",
            NameAr = "وردية الصباح التشغيلية",
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(17, 0),
            EarlyStartTime = new TimeOnly(7, 0),
            OnTimeStartTime = new TimeOnly(8, 0),
            LateStartTime = new TimeOnly(9, 15),
            CutoffTime = new TimeOnly(10, 0),
            IsActive = true
        };
        _dbContext.WorkShifts.Add(shift);

        var schedule = new WorkSchedule
        {
            Id = Guid.NewGuid(),
            Name = "Weekly Schedule",
            IsDefault = true,
            IsActive = true,
            Days = [
                new WorkScheduleDay
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = DayOfWeek.Monday,
                    IsWorkingDay = true,
                    WorkShiftId = shift.Id,
                    Shift = shift
                }
            ]
        };
        _dbContext.WorkSchedules.Add(schedule);

        var earlyRule = new PointRule
        {
            Id = Guid.NewGuid(),
            Name = "Early Arrival Incentive",
            NameAr = "حافز الحضور المبكر",
            Category = PointCategory.Green,
            EventType = PointEventType.EarlyArrival,
            Points = 1,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30))
        };
        _dbContext.PointRules.Add(earlyRule);
        await _dbContext.SaveChangesAsync();

        // Check in on a Monday at 07:30 (between EarlyStartTime 07:00 and OnTimeStartTime 08:00)
        var checkInUtc = new DateTime(2026, 11, 23, 7, 30, 0, DateTimeKind.Utc); // 2026-11-23 is Monday

        // Act: Resolve Shift
        var resolution = await _shiftResolutionService.ResolveShiftForCheckInAsync(employee, checkInUtc);

        // Assert: Classified as Early
        Assert.NotNull(resolution.Shift);
        Assert.Equal(ArrivalClassification.Early, resolution.Classification);

        // Act: Evaluate Points
        var attendanceRecord = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Date = DateOnly.FromDateTime(checkInUtc),
            CheckInTimeUtc = checkInUtc,
            WorkShiftId = shift.Id,
            ArrivalClassification = resolution.Classification,
            CheckInStatus = VerificationStatus.Verified,
            Status = AttendanceStatus.Present
        };
        _dbContext.AttendanceRecords.Add(attendanceRecord);
        await _dbContext.SaveChangesAsync();

        var pointTransactions = await _pointEngine.EvaluateAttendanceEventAsync(attendanceRecord);

        // Assert: EarlyArrival rule evaluated, +1 Green Point awarded
        Assert.Single(pointTransactions);
        var tx = pointTransactions[0];
        Assert.Equal(earlyRule.Id, tx.RuleId);
        Assert.Equal(1, tx.Points);
        Assert.Equal(PointCategory.Green, tx.Category);
        Assert.Equal(PointEventType.EarlyArrival, tx.EventType);
        Assert.Equal(PointTransactionStatus.Finalized, tx.Status);
    }

    [Fact]
    public async Task CheckOutGpsException_Approval_PreservesTimestamp_SetsStatusCompleted_And_ZeroDuplicateArrivalPoints()
    {
        // Arrange
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-GPS02",
            FirstName = "Noura",
            LastName = "Al-Otaibi",
            FirstNameAr = "نورة",
            LastNameAr = "العتيبي",
            Email = "noura@nasaq.test",
            IsActive = true
        };
        _dbContext.Employees.Add(employee);

        var checkInTime = new DateTime(2026, 11, 21, 8, 0, 0, DateTimeKind.Utc);
        var checkOutTime = new DateTime(2026, 11, 21, 16, 30, 0, DateTimeKind.Utc);

        var record = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Date = DateOnly.FromDateTime(checkInTime),
            CheckInTimeUtc = checkInTime,
            CheckInStatus = VerificationStatus.Verified, // Check-in was already verified
            ArrivalClassification = ArrivalClassification.OnTime,
            CheckOutTimeUtc = checkOutTime,
            CheckOutStatus = VerificationStatus.PendingReview, // Check-out in Pending Review
            CheckOutFailureReason = "low_accuracy: device reported 209m, threshold is 50m",
            Status = AttendanceStatus.PendingReview,
            DurationMinutes = 510
        };
        _dbContext.AttendanceRecords.Add(record);
        await _dbContext.SaveChangesAsync();

        var adminUser = new FakeCurrentUser
        {
            UserId = Guid.NewGuid().ToString(),
            UserName = "SuperAdmin",
            RolesList = [RoleNames.Admin]
        };

        var handler = new ApproveGpsExceptionHandler(_dbContext, adminUser, _pointEngine);

        // Act: Approve exception without specifying EventType (defaults to CheckIn, but auto-resolves to CheckOut because CheckOutStatus is PendingReview)
        var command = new ApproveGpsExceptionCommand(record.Id, "CheckIn", "GPS accuracy glitch approved by supervisor");
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert: Success and transition to Completed
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.Equal("Verified", result.Data.CheckOutStatus);
        Assert.Equal("Completed", result.Data.Status);
        Assert.Equal(checkOutTime, result.Data.CheckOutTimeUtc); // Preserved original checkout timestamp!
        Assert.Contains("GPS accuracy glitch approved", result.Data.ReviewNotes);

        // Assert: DEC-021 policy adherence - zero duplicate arrival points awarded on check-out
        var transactions = await _dbContext.PointTransactions
            .Where(t => t.SourceEventId == record.Id)
            .ToListAsync();
        Assert.Empty(transactions);
    }

    [Fact]
    public async Task CheckOutGpsException_Rejection_TransitionsCheckOutToRejected()
    {
        // Arrange
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-GPS03",
            FirstName = "Fahad",
            LastName = "Al-Dosari",
            FirstNameAr = "فهد",
            LastNameAr = "الدوسري",
            Email = "fahad@nasaq.test",
            IsActive = true
        };
        _dbContext.Employees.Add(employee);

        var checkInTime = new DateTime(2026, 11, 21, 8, 0, 0, DateTimeKind.Utc);
        var checkOutTime = new DateTime(2026, 11, 21, 16, 0, 0, DateTimeKind.Utc);

        var record = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Date = DateOnly.FromDateTime(checkInTime),
            CheckInTimeUtc = checkInTime,
            CheckInStatus = VerificationStatus.Verified,
            CheckOutTimeUtc = checkOutTime,
            CheckOutStatus = VerificationStatus.PendingReview,
            CheckOutFailureReason = "outside_geofence_checkout: 1200m from worksite",
            Status = AttendanceStatus.PendingReview
        };
        _dbContext.AttendanceRecords.Add(record);
        await _dbContext.SaveChangesAsync();

        var adminUser = new FakeCurrentUser
        {
            UserId = Guid.NewGuid().ToString(),
            UserName = "AdminUser",
            RolesList = [RoleNames.Admin]
        };

        var handler = new RejectGpsExceptionHandler(_dbContext, adminUser);

        // Act
        var command = new RejectGpsExceptionCommand(record.Id, "CheckOut", "Confirmed employee left site early without clocking");
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.Equal("Rejected", result.Data.CheckOutStatus);
        Assert.Equal("Rejected", result.Data.Status);
        Assert.Contains("Confirmed employee left site early", result.Data.ReviewNotes);
    }

    [Fact]
    public async Task ApprovedLeave_Integration_ExemptsEmployee_ReflectsInCurrentStatus()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var leaveType = new LeaveType
        {
            Id = Guid.NewGuid(),
            Name = "Annual Vacation",
            NameAr = "إجازة سنوية اعتيادية",
            IsPaid = true,
            IsActive = true
        };
        _dbContext.LeaveTypes.Add(leaveType);

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EmployeeCode = "EMP-LEAVE01",
            FirstName = "Abdullah",
            LastName = "Al-Ghamdi",
            FirstNameAr = "عبدالله",
            LastNameAr = "الغامدي",
            Email = "abdullah@nasaq.test",
            IsActive = true
        };
        _dbContext.Employees.Add(employee);

        var approvedLeave = new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = today.AddDays(-1),
            EndDate = today.AddDays(2),
            DaysCount = 4,
            Status = LeaveRequestStatus.Approved,
            Reason = "Family vacation"
        };
        _dbContext.LeaveRequests.Add(approvedLeave);
        await _dbContext.SaveChangesAsync();

        // Act: Verify Point Calculation Engine knows employee is on approved leave
        var isOnLeave = await _pointEngine.IsEmployeeOnApprovedLeaveAsync(employee.Id, today);
        Assert.True(isOnLeave);

        // Act: Current Attendance Status query
        var currentUser = new FakeCurrentUser { UserId = userId, UserName = "abdullah" };
        var handler = new GetCurrentAttendanceStatusHandler(
            _dbContext,
            currentUser,
            _shiftResolutionService);

        var result = await handler.Handle(new GetCurrentAttendanceStatusQuery(), CancellationToken.None);

        // Assert: Accurately reflected in status DTO
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.True(result.Data.IsOnApprovedLeave);
        Assert.Equal("Annual Vacation", result.Data.ApprovedLeaveTypeName);
        Assert.Equal("إجازة سنوية اعتيادية", result.Data.ApprovedLeaveTypeNameAr);
        Assert.Contains("approved leave", result.Data.ShiftNotice, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ApprovedLeave_Integration_ReflectsInDailyAttendanceReport_And_ExcludesFromLatenessReport()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var targetDateTime = DateTime.UtcNow.Date;

        var leaveType = new LeaveType
        {
            Id = Guid.NewGuid(),
            Name = "Maternity Leave",
            NameAr = "إجازة أمومة ورعاية",
            IsPaid = true,
            IsActive = true
        };
        _dbContext.LeaveTypes.Add(leaveType);

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-LEAVE02",
            FirstName = "Mona",
            LastName = "Al-Shehri",
            FirstNameAr = "منى",
            LastNameAr = "الشهري",
            Email = "mona@nasaq.test",
            Department = "Finance",
            DepartmentAr = "المالية",
            IsActive = true
        };
        _dbContext.Employees.Add(employee);

        var approvedLeave = new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = today,
            EndDate = today.AddDays(5),
            DaysCount = 6,
            Status = LeaveRequestStatus.Approved,
            Reason = "Childcare"
        };
        _dbContext.LeaveRequests.Add(approvedLeave);
        await _dbContext.SaveChangesAsync();

        var adminUser = new FakeCurrentUser
        {
            UserId = Guid.NewGuid().ToString(),
            UserName = "AdminAuditor",
            RolesList = [RoleNames.Admin]
        };

        var handler = new ExecuteReportHandler(_dbContext, adminUser);

        // Act 1: Generate Daily Attendance Report with Language = "ar"
        var dailyFilter = new ReportFilterRequest
        {
            ReportId = "daily-attendance",
            FromDate = targetDateTime,
            Language = "ar"
        };
        var dailyResult = await handler.Handle(new ExecuteReportQuery(dailyFilter), CancellationToken.None);

        // Assert 1: Daily Attendance includes the excused leave row with localized names and KPI
        Assert.True(dailyResult.Succeeded);
        var dailyData = dailyResult.Data;
        Assert.NotNull(dailyData);

        var excusedRow = dailyData.Rows.FirstOrDefault(r => (string?)r["employeeCode"] == "EMP-LEAVE02");
        Assert.NotNull(excusedRow);
        Assert.Equal("منى الشهري", excusedRow["employeeName"]);
        Assert.Equal("المالية", excusedRow["department"]);
        Assert.Equal("إجازة معتمدة", excusedRow["status"]);
        Assert.Equal("إجازة أمومة ورعاية", excusedRow["classification"]);
        Assert.Equal(0.0, excusedRow["durationHours"]);

        var leaveKpi = dailyData.SummaryKpis.FirstOrDefault(k => k.Key == "approved_leaves");
        Assert.NotNull(leaveKpi);
        Assert.Equal(1, Convert.ToInt32(leaveKpi.Value));

        // Act 2: Generate Lateness & Absence Exceptions Report
        var latenessFilter = new ReportFilterRequest
        {
            ReportId = "lateness-absence",
            FromDate = targetDateTime.AddDays(-7),
            ToDate = targetDateTime.AddDays(7),
            Language = "ar"
        };
        var latenessResult = await handler.Handle(new ExecuteReportQuery(latenessFilter), CancellationToken.None);

        // Assert 2: Employee on approved leave is NOT flagged in lateness/absence report
        Assert.True(latenessResult.Succeeded);
        var latenessRows = latenessResult.Data?.Rows ?? [];
        Assert.DoesNotContain(latenessRows, r => (string?)r["employeeCode"] == "EMP-LEAVE02");
    }

    [Fact]
    public async Task BilingualBusinessData_Exposure_ReturnsArabicAndEnglishProperties()
    {
        // Arrange
        var loc = new WorkLocation
        {
            Id = Guid.NewGuid(),
            Name = "Riyadh Head Office",
            NameAr = "المقر الرئيسي - الرياض",
            Address = "King Fahd Road",
            AddressAr = "طريق الملك فهد",
            Latitude = 24.7136,
            Longitude = 46.6753,
            RadiusMeters = 200,
            AccuracyThresholdMeters = 50,
            IsActive = true
        };
        _dbContext.WorkLocations.Add(loc);

        var shift = new WorkShift
        {
            Id = Guid.NewGuid(),
            Name = "Evening Shift",
            NameAr = "الوردية المسائية",
            StartTime = new TimeOnly(16, 0),
            EndTime = new TimeOnly(0, 0),
            IsActive = true
        };
        _dbContext.WorkShifts.Add(shift);

        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-BILINGUAL",
            FirstName = "Omar",
            LastName = "Al-Zahrani",
            FirstNameAr = "عمر",
            LastNameAr = "الزهراني",
            Email = "omar@nasaq.test",
            Department = "Engineering",
            DepartmentAr = "الهندسة والتقنية",
            WorkLocationId = loc.Id,
            IsActive = true
        };
        _dbContext.Employees.Add(emp);

        var att = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = emp.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            CheckInTimeUtc = DateTime.UtcNow,
            CheckInStatus = VerificationStatus.Verified,
            WorkLocationId = loc.Id,
            WorkShiftId = shift.Id,
            Status = AttendanceStatus.Present,
            Employee = emp,
            WorkLocation = loc,
            WorkShift = shift
        };
        _dbContext.AttendanceRecords.Add(att);
        await _dbContext.SaveChangesAsync();

        // Act: Bilingual DTO generation
        var attDtoEn = AttendanceRecordDto.FromEntity(att, "en");
        var attDtoAr = AttendanceRecordDto.FromEntity(att, "ar");

        // Assert: Arabic DTO preserves Arabic names
        Assert.Equal("عمر الزهراني", attDtoAr.EmployeeNameAr);
        Assert.Equal("الهندسة والتقنية", attDtoAr.DepartmentAr);
        Assert.Equal("المقر الرئيسي - الرياض", attDtoAr.WorkLocationNameAr);
        Assert.Equal("الوردية المسائية", attDtoAr.WorkShiftNameAr);

        // Assert: English DTO preserves English names
        Assert.Equal("Omar Al-Zahrani", attDtoEn.EmployeeName);
        Assert.Equal("Engineering", attDtoEn.Department);
        Assert.Equal("Riyadh Head Office", attDtoEn.WorkLocationName);
        Assert.Equal("Evening Shift", attDtoEn.WorkShiftName);
    }
}
