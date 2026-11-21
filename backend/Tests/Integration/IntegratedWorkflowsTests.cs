using Application.Abstractions;
using Application.Features.Attendance.Commands.CheckIn;
using Application.Features.Attendance.Commands.CheckOut;
using Application.Features.Points.Commands.ReversePointTransaction;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Tests.Fakes;
using Xunit;

namespace Tests.Integration;

public class IntegratedWorkflowsTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly GeofenceService _geofenceService;
    private readonly ShiftResolutionService _shiftResolutionService;
    private readonly PointCalculationEngine _pointEngine;

    public IntegratedWorkflowsTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "IntegratedQA_" + Guid.NewGuid().ToString("N"))
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _unitOfWork = new UnitOfWork(_dbContext, NullLogger<UnitOfWork>.Instance);
        _geofenceService = new GeofenceService();
        _shiftResolutionService = new ShiftResolutionService(_dbContext);
        _pointEngine = new PointCalculationEngine(_dbContext);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task WorkflowA_StandardAttendance_GeneratesVerifiedAttendanceAndGreenPoints()
    {
        var userId = Guid.NewGuid().ToString();
        var nowUtc = DateTime.UtcNow;
        var todayDay = nowUtc.DayOfWeek;

        // 1. Setup Location (Riyadh HQ, radius 100m)
        var location = new WorkLocation
        {
            Id = Guid.NewGuid(),
            Name = "Riyadh HQ",
            Latitude = 24.7136,
            Longitude = 46.6753,
            RadiusMeters = 100,
            IsActive = true
        };
        _dbContext.WorkLocations.Add(location);

        // 2. Setup Shift for on-time arrival
        var shift = new WorkShift
        {
            Id = Guid.NewGuid(),
            Name = "Active Dynamic Shift",
            StartTime = TimeOnly.FromDateTime(nowUtc.AddMinutes(-10)),
            EndTime = TimeOnly.FromDateTime(nowUtc.AddHours(4)),
            EarlyStartTime = null,
            OnTimeStartTime = null,
            LateStartTime = null,
            CutoffTime = null,
            IsOvernight = false,
            IsActive = true
        };
        _dbContext.WorkShifts.Add(shift);

        // 3. Setup Schedule with today as active working day
        var schedule = new WorkSchedule
        {
            Id = Guid.NewGuid(),
            Name = "Corporate Schedule",
            IsDefault = true,
            IsActive = true,
            Days = new List<WorkScheduleDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = todayDay,
                    IsWorkingDay = true,
                    WorkShiftId = shift.Id,
                    Shift = shift
                }
            }
        };
        _dbContext.WorkSchedules.Add(schedule);

        // 4. Setup Employee
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EmployeeCode = "EMP100",
            FirstName = "Yasser",
            LastName = "Al-Harbi",
            Email = "yasser@nasaq.test",
            WorkLocationId = location.Id,
            WorkLocation = location,
            IsActive = true,
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);

        // 5. Setup Point Rule (+10 Green points for on-time arrival)
        var onTimeRule = new PointRule
        {
            Id = Guid.NewGuid(),
            Name = "On-Time Arrival Reward",
            Category = PointCategory.Green,
            EventType = PointEventType.OnTimeArrival,
            Points = 10,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(nowUtc.AddDays(-30))
        };
        _dbContext.PointRules.Add(onTimeRule);
        await _dbContext.SaveChangesAsync();

        // 6. Check-in inside geofence
        var fakeCurrentUser = new FakeCurrentUser
        {
            UserId = userId,
            UserName = "yasser@nasaq.test"
        };

        var checkInHandler = new CheckInHandler(
            _dbContext,
            _unitOfWork,
            fakeCurrentUser,
            _geofenceService,
            _shiftResolutionService,
            _pointEngine);

        var checkInCommand = new CheckInCommand
        {
            Latitude = 24.7138,
            Longitude = 46.6754,
            AccuracyMeters = 10,
            Notes = "Arrived at office on time"
        };

        var checkInResult = await checkInHandler.Handle(checkInCommand, CancellationToken.None);

        Assert.True(checkInResult.Succeeded, $"CheckIn failed: {checkInResult.Message}");
        Assert.NotNull(checkInResult.Data);
        Assert.Equal(AttendanceStatus.Present.ToString(), checkInResult.Data.Status);
        Assert.Equal(VerificationStatus.Verified.ToString(), checkInResult.Data.CheckInStatus);
        Assert.Equal(ArrivalClassification.OnTime.ToString(), checkInResult.Data.ArrivalClassification);

        // Verify Database Persistence of Attendance
        var attendanceRecord = await _dbContext.AttendanceRecords.FirstOrDefaultAsync(a => a.EmployeeId == employee.Id);
        Assert.NotNull(attendanceRecord);
        Assert.Equal(VerificationStatus.Verified, attendanceRecord.CheckInStatus);

        // Verify Points Transaction in Ledger
        var pointTx = await _dbContext.PointTransactions.FirstOrDefaultAsync(t => t.EmployeeId == employee.Id);
        Assert.NotNull(pointTx);
        Assert.Equal(10, pointTx.Points);
        Assert.Equal(PointCategory.Green, pointTx.Category);
        Assert.Equal(PointTransactionStatus.Finalized, pointTx.Status);

        // 7. Check-out inside geofence
        var checkOutHandler = new CheckOutHandler(
            _dbContext,
            _unitOfWork,
            fakeCurrentUser,
            _geofenceService,
            _pointEngine);

        var checkOutCommand = new CheckOutCommand
        {
            Latitude = 24.7137,
            Longitude = 46.6753,
            AccuracyMeters = 8,
            Notes = "Completed shift"
        };

        var checkOutResult = await checkOutHandler.Handle(checkOutCommand, CancellationToken.None);

        Assert.True(checkOutResult.Succeeded);
        Assert.NotNull(checkOutResult.Data);
        Assert.Equal(AttendanceStatus.Completed.ToString(), checkOutResult.Data.Status);
        Assert.Equal(VerificationStatus.Verified.ToString(), checkOutResult.Data.CheckOutStatus);
    }

    [Fact]
    public async Task WorkflowB_OvernightShift_ResolvesCorrectShiftDateAndDuration()
    {
        // 1. Overnight Shift (22:00 to 06:00)
        var shift = new WorkShift
        {
            Id = Guid.NewGuid(),
            Name = "Overnight Security",
            StartTime = new TimeOnly(22, 0),
            EndTime = new TimeOnly(6, 0),
            EarlyStartTime = new TimeOnly(21, 30),
            OnTimeStartTime = new TimeOnly(22, 15),
            LateStartTime = new TimeOnly(22, 30),
            CutoffTime = new TimeOnly(7, 0),
            IsOvernight = true,
            IsActive = true
        };
        _dbContext.WorkShifts.Add(shift);

        // Schedule: Saturday overnight shift
        var schedule = new WorkSchedule
        {
            Id = Guid.NewGuid(),
            Name = "Overnight Schedule",
            IsDefault = true,
            IsActive = true,
            Days = new List<WorkScheduleDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = DayOfWeek.Saturday,
                    IsWorkingDay = true,
                    WorkShiftId = shift.Id,
                    Shift = shift
                }
            }
        };
        _dbContext.WorkSchedules.Add(schedule);

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP101",
            FirstName = "Majed",
            LastName = "Al-Otaibi",
            Email = "majed@nasaq.test",
            IsActive = true,
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);
        await _dbContext.SaveChangesAsync();

        // 2026-11-21 is a Saturday. Check-in at 22:05 UTC
        var checkInUtc = new DateTime(2026, 11, 21, 22, 5, 0, DateTimeKind.Utc);
        var resolution = await _shiftResolutionService.ResolveShiftForCheckInAsync(employee, checkInUtc);

        Assert.NotNull(resolution.Shift);
        Assert.Equal("Overnight Security", resolution.Shift.Name);
        Assert.True(resolution.Shift.IsOvernight);
        Assert.Equal(ArrivalClassification.OnTime, resolution.Classification);
        Assert.Equal(new DateOnly(2026, 11, 21), resolution.ShiftDate);
        Assert.Equal(8.0, resolution.Shift.DurationHours);
    }

    [Fact]
    public async Task WorkflowC_GeofenceBreach_ResultsInPendingReviewStatusAndPoints()
    {
        var userId = Guid.NewGuid().ToString();
        var nowUtc = DateTime.UtcNow;
        var todayDay = nowUtc.DayOfWeek;

        // 1. Location (Riyadh HQ, radius 100m)
        var location = new WorkLocation
        {
            Id = Guid.NewGuid(),
            Name = "Riyadh HQ",
            Latitude = 24.7136,
            Longitude = 46.6753,
            RadiusMeters = 100,
            IsActive = true
        };
        _dbContext.WorkLocations.Add(location);

        // Active shift
        var shift = new WorkShift
        {
            Id = Guid.NewGuid(),
            Name = "Active Dynamic Shift",
            StartTime = TimeOnly.FromDateTime(nowUtc.AddMinutes(-10)),
            EndTime = TimeOnly.FromDateTime(nowUtc.AddHours(4)),
            EarlyStartTime = null,
            OnTimeStartTime = null,
            LateStartTime = null,
            CutoffTime = null,
            IsOvernight = false,
            IsActive = true
        };
        _dbContext.WorkShifts.Add(shift);

        var schedule = new WorkSchedule
        {
            Id = Guid.NewGuid(),
            Name = "Corporate Schedule",
            IsDefault = true,
            IsActive = true,
            Days = new List<WorkScheduleDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = todayDay,
                    IsWorkingDay = true,
                    WorkShiftId = shift.Id,
                    Shift = shift
                }
            }
        };
        _dbContext.WorkSchedules.Add(schedule);

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EmployeeCode = "EMP102",
            FirstName = "Fahad",
            LastName = "Al-Dosari",
            Email = "fahad@nasaq.test",
            WorkLocationId = location.Id,
            WorkLocation = location,
            IsActive = true,
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);

        var rule = new PointRule
        {
            Id = Guid.NewGuid(),
            Name = "On-Time Check-in",
            Category = PointCategory.Green,
            EventType = PointEventType.OnTimeArrival,
            Points = 10,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(nowUtc.AddDays(-10))
        };
        _dbContext.PointRules.Add(rule);
        await _dbContext.SaveChangesAsync();

        var fakeCurrentUser = new FakeCurrentUser
        {
            UserId = userId,
            UserName = "fahad@nasaq.test"
        };

        var checkInHandler = new CheckInHandler(
            _dbContext,
            _unitOfWork,
            fakeCurrentUser,
            _geofenceService,
            _shiftResolutionService,
            _pointEngine);

        // Employee attempts check-in from 5 kilometers away!
        var checkInCommand = new CheckInCommand
        {
            Latitude = 24.7500,
            Longitude = 46.7000,
            AccuracyMeters = 15,
            Notes = "Checking in remotely"
        };

        var checkInResult = await checkInHandler.Handle(checkInCommand, CancellationToken.None);

        Assert.True(checkInResult.Succeeded, $"CheckIn failed: {checkInResult.Message}");
        Assert.NotNull(checkInResult.Data);
        // Under DEC-006, geofence breaches trigger PendingReview
        Assert.Equal(AttendanceStatus.PendingReview.ToString(), checkInResult.Data.Status);
        Assert.Equal(VerificationStatus.PendingReview.ToString(), checkInResult.Data.CheckInStatus);

        // Verify Points Transaction is also PendingReview
        var pointTx = await _dbContext.PointTransactions.FirstOrDefaultAsync(t => t.EmployeeId == employee.Id);
        Assert.NotNull(pointTx);
        Assert.Equal(PointTransactionStatus.PendingReview, pointTx.Status);
    }

    [Fact]
    public async Task WorkflowD_DuplicateCheckIn_IsRejectedWithConflict()
    {
        var userId = Guid.NewGuid().ToString();

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EmployeeCode = "EMP103",
            FirstName = "Nora",
            LastName = "Al-Saud",
            Email = "nora@nasaq.test",
            IsActive = true,
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);

        var existingAttendance = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            CheckInTimeUtc = DateTime.UtcNow.AddMinutes(-30),
            Status = AttendanceStatus.Present,
            CheckInStatus = VerificationStatus.Verified
        };
        _dbContext.AttendanceRecords.Add(existingAttendance);
        await _dbContext.SaveChangesAsync();

        var fakeCurrentUser = new FakeCurrentUser
        {
            UserId = userId,
            UserName = "nora@nasaq.test"
        };

        var checkInHandler = new CheckInHandler(
            _dbContext,
            _unitOfWork,
            fakeCurrentUser,
            _geofenceService,
            _shiftResolutionService,
            _pointEngine);

        var checkInCommand = new CheckInCommand
        {
            Latitude = 24.7136,
            Longitude = 46.6753,
            AccuracyMeters = 10,
            Notes = "Second check-in attempt"
        };

        var result = await checkInHandler.Handle(checkInCommand, CancellationToken.None);

        // Must reject duplicate check-in
        Assert.False(result.Succeeded);
        Assert.Equal(409, (int)result.StatusCode);
    }

    [Fact]
    public async Task WorkflowE_AdministrativeReversal_CreatesAuditableOffsettingTransaction()
    {
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP104",
            FirstName = "Khaled",
            LastName = "Al-Mansoor",
            Email = "khaled@nasaq.test",
            IsActive = true,
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);

        var rule = new PointRule
        {
            Id = Guid.NewGuid(),
            Name = "Late Arrival Penalty",
            Category = PointCategory.Red,
            EventType = PointEventType.LateArrival,
            Points = 5,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10))
        };
        _dbContext.PointRules.Add(rule);

        var originalTx = new PointTransaction
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Employee = employee,
            RuleId = rule.Id,
            Rule = rule,
            Category = PointCategory.Red,
            EventType = PointEventType.LateArrival,
            Points = -5,
            Status = PointTransactionStatus.Finalized,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            TimestampUtc = DateTime.UtcNow,
            Reason = "Automated late arrival penalty"
        };
        _dbContext.PointTransactions.Add(originalTx);
        await _dbContext.SaveChangesAsync();

        var reversalHandler = new ReversePointTransactionHandler(_dbContext);

        var command = new ReversePointTransactionCommand(
            TransactionId: originalTx.Id,
            Reason: "Administrative waiver: traffic delay approved by HR");

        var result = await reversalHandler.Handle(command, CancellationToken.None);

        Assert.True(result.Succeeded, $"Reversal failed: {result.Message}");
        Assert.NotNull(result.Data);

        // Verify original transaction is marked Reversed
        var updatedOriginal = await _dbContext.PointTransactions.FindAsync(originalTx.Id);
        Assert.NotNull(updatedOriginal);
        Assert.Equal(PointTransactionStatus.Reversed, updatedOriginal.Status);

        // Verify offsetting reversal transaction
        var reversalTx = await _dbContext.PointTransactions
            .FirstOrDefaultAsync(t => t.RelatedTransactionId == originalTx.Id);
        Assert.NotNull(reversalTx);
        Assert.Equal(+5, reversalTx.Points); // Offsets the -5
        Assert.Equal(PointTransactionStatus.Finalized, reversalTx.Status);
        Assert.Contains("Administrative waiver", reversalTx.Reason);
    }

    [Fact]
    public async Task WorkflowF_AfterCutoffCheckIn_AssignsPresentStatusAndBlackCardUnderDEC004()
    {
        var userId = Guid.NewGuid().ToString();
        var nowUtc = DateTime.UtcNow;
        var todayDay = nowUtc.DayOfWeek;

        // 1. Setup Location
        var location = new WorkLocation
        {
            Id = Guid.NewGuid(),
            Name = "Dammam Facility",
            Latitude = 26.4207,
            Longitude = 50.0888,
            RadiusMeters = 150,
            IsActive = true
        };
        _dbContext.WorkLocations.Add(location);

        // 2. Setup Shift: Start 08:00, Cutoff 12:00, End 18:00
        // Current time is set to 20 minutes after cutoff, but well before shift end
        var shift = new WorkShift
        {
            Id = Guid.NewGuid(),
            Name = "Morning Operational Shift",
            StartTime = TimeOnly.FromDateTime(nowUtc.AddHours(-4)), // 4 hours ago
            CutoffTime = TimeOnly.FromDateTime(nowUtc.AddMinutes(-20)), // Cutoff was 20 mins ago
            EndTime = TimeOnly.FromDateTime(nowUtc.AddHours(3)), // Shift ends in 3 hours
            EarlyStartTime = null,
            OnTimeStartTime = null,
            LateStartTime = TimeOnly.FromDateTime(nowUtc.AddHours(-3)),
            IsOvernight = false,
            IsActive = true
        };
        _dbContext.WorkShifts.Add(shift);

        // 3. Setup Schedule
        var schedule = new WorkSchedule
        {
            Id = Guid.NewGuid(),
            Name = "Standard Morning Schedule",
            IsDefault = true,
            IsActive = true,
            Days = new List<WorkScheduleDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = todayDay,
                    IsWorkingDay = true,
                    WorkShiftId = shift.Id,
                    Shift = shift
                }
            }
        };
        _dbContext.WorkSchedules.Add(schedule);

        // 4. Setup Employee
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EmployeeCode = "EMP105",
            FirstName = "Saud",
            LastName = "Al-Shammari",
            Email = "saud@nasaq.test",
            WorkLocationId = location.Id,
            WorkLocation = location,
            IsActive = true,
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);

        // 5. Setup Black Card Rule for AfterCutoffArrival (DEC-004)
        var blackCardRule = new PointRule
        {
            Id = Guid.NewGuid(),
            Name = "After Cutoff Arrival Black Card",
            Category = PointCategory.Black,
            EventType = PointEventType.AfterCutoffArrival,
            Points = 1,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(nowUtc.AddDays(-30))
        };
        _dbContext.PointRules.Add(blackCardRule);
        await _dbContext.SaveChangesAsync();

        var fakeCurrentUser = new FakeCurrentUser
        {
            UserId = userId,
            UserName = "saud@nasaq.test"
        };

        var checkInHandler = new CheckInHandler(
            _dbContext,
            _unitOfWork,
            fakeCurrentUser,
            _geofenceService,
            _shiftResolutionService,
            _pointEngine);

        var checkInCommand = new CheckInCommand
        {
            Latitude = 26.4208,
            Longitude = 50.0889,
            AccuracyMeters = 10,
            Notes = "Delayed arrival after cutoff"
        };

        var result = await checkInHandler.Handle(checkInCommand, CancellationToken.None);

        // Assertions for DEC-004:
        // 1. Check-in must be accepted (not blocked)
        Assert.True(result.Succeeded, $"CheckIn failed: {result.Message}");
        Assert.NotNull(result.Data);

        // 2. Attendance Status must be Present (explicitly NOT Absent!)
        Assert.Equal(AttendanceStatus.Present.ToString(), result.Data.Status);

        // 3. Arrival Classification must be AfterCutoff
        Assert.Equal(ArrivalClassification.AfterCutoff.ToString(), result.Data.ArrivalClassification);

        // 4. Verification Status inside geofence is Verified
        Assert.Equal(VerificationStatus.Verified.ToString(), result.Data.CheckInStatus);

        // 5. Verify Database Record reflects Present and AfterCutoff
        var record = await _dbContext.AttendanceRecords.FirstOrDefaultAsync(a => a.EmployeeId == employee.Id);
        Assert.NotNull(record);
        Assert.Equal(AttendanceStatus.Present, record.Status);
        Assert.Equal(ArrivalClassification.AfterCutoff, record.ArrivalClassification);

        // 6. Verify Black Card Point Transaction was posted (Category = Black, NOT monetary deduction)
        var pointTx = await _dbContext.PointTransactions.FirstOrDefaultAsync(t => t.EmployeeId == employee.Id);
        Assert.NotNull(pointTx);
        Assert.Equal(PointCategory.Black, pointTx.Category);
        Assert.Equal(PointEventType.AfterCutoffArrival, pointTx.EventType);
        Assert.Equal(PointTransactionStatus.Finalized, pointTx.Status);
    }

    [Fact]
    public async Task WorkflowG_CheckOutWithoutPriorCheckIn_FailsWithBadRequest()
    {
        var userId = Guid.NewGuid().ToString();

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EmployeeCode = "EMP106",
            FirstName = "Tareq",
            LastName = "Al-Ghamdi",
            Email = "tareq@nasaq.test",
            IsActive = true,
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);
        await _dbContext.SaveChangesAsync();

        var fakeCurrentUser = new FakeCurrentUser
        {
            UserId = userId,
            UserName = "tareq@nasaq.test"
        };

        var checkOutHandler = new CheckOutHandler(
            _dbContext,
            _unitOfWork,
            fakeCurrentUser,
            _geofenceService,
            _pointEngine);

        var checkOutCommand = new CheckOutCommand
        {
            Latitude = 24.7136,
            Longitude = 46.6753,
            AccuracyMeters = 10
        };

        var result = await checkOutHandler.Handle(checkOutCommand, CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, result.StatusCode);
        Assert.Contains("Please check in first", result.Message);
    }
}
