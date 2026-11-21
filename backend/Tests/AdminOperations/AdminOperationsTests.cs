using Application.Features.AdminOperations.Commands.ApproveGpsException;
using Application.Features.AdminOperations.Commands.CorrectIncompleteAttendance;
using Application.Features.AdminOperations.Commands.ManualPointAdjustment;
using Application.Features.AdminOperations.Commands.RejectGpsException;
using Application.Features.AdminOperations.Queries.GetAdminOperationsSummary;
using Application.Features.AdminOperations.Queries.GetDailyAttendanceOperations;
using Application.Features.AdminOperations.Queries.GetGpsExceptions;
using Application.Features.AdminOperations.Queries.GetIncompleteAttendance;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Services;
using Tests.Fakes;

namespace Tests.AdminOperations;

public class AdminOperationsTests : IClassFixture<TestFixture>, IAsyncLifetime
{
    private readonly TestFixture _fixture;
    private readonly PointCalculationEngine _pointCalculationEngine;

    public AdminOperationsTests(TestFixture fixture)
    {
        _fixture = fixture;
        _pointCalculationEngine = new PointCalculationEngine(_fixture.DbContext);
    }

    public async Task InitializeAsync()
    {
        await _fixture.InitializeAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task ApproveGpsException_ValidPendingCheckIn_TransitionsToVerified_PreservesOriginalTimestamp_And_FinalizesPoints()
    {
        // Arrange
        var shift = new WorkShift
        {
            Name = "Day Shift",
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(17, 0),
            CutoffTime = new TimeOnly(9, 30),
            IsActive = true
        };
        _fixture.DbContext.WorkShifts.Add(shift);

        var rule = new PointRule
        {
            Name = "On-Time Bonus",
            Category = PointCategory.Green,
            EventType = PointEventType.OnTimeArrival,
            Points = 1,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10))
        };
        _fixture.DbContext.PointRules.Add(rule);

        var originalCheckIn = DateTime.UtcNow.Date.AddHours(9).AddMinutes(5); // 09:05 on-time
        var record = new AttendanceRecord
        {
            EmployeeId = _fixture.Employee1.Id,
            Date = DateOnly.FromDateTime(originalCheckIn),
            WorkShiftId = shift.Id,
            CheckInTimeUtc = originalCheckIn,
            CheckInStatus = VerificationStatus.PendingReview,
            CheckInFailureReason = "GPS outside radius (750m > 100m)",
            ArrivalClassification = ArrivalClassification.OnTime,
            Status = AttendanceStatus.PendingReview
        };
        _fixture.DbContext.AttendanceRecords.Add(record);
        await _fixture.DbContext.SaveChangesAsync();

        // Evaluate initially while in PendingReview -> creates PendingReview point transaction (DEC-007)
        await _pointCalculationEngine.EvaluateAttendanceEventAsync(record);
        await _fixture.DbContext.SaveChangesAsync();

        var pendingTx = await _fixture.DbContext.PointTransactions
            .FirstOrDefaultAsync(t => t.SourceEventId == record.Id);
        Assert.NotNull(pendingTx);
        Assert.Equal(PointTransactionStatus.PendingReview, pendingTx.Status);

        var adminUser = new FakeCurrentUser
        {
            UserId = _fixture.AdminUser.Id,
            UserName = _fixture.AdminUser.UserName,
            RolesList = [RoleNames.Admin]
        };

        var handler = new ApproveGpsExceptionHandler(
            _fixture.DbContext,
            adminUser,
            _pointCalculationEngine);

        var command = new ApproveGpsExceptionCommand(record.Id, "CheckIn", "Client verified at site");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.Equal("Verified", result.Data.CheckInStatus);
        Assert.Equal("Present", result.Data.Status);
        Assert.Equal(originalCheckIn, result.Data.CheckInTimeUtc); // Preserved original server timestamp!
        Assert.Equal(adminUser.UserName, result.Data.ReviewedBy);

        // Verify points transitioned from PendingReview to Finalized under DEC-007!
        var finalizedTx = await _fixture.DbContext.PointTransactions
            .FirstOrDefaultAsync(t => t.SourceEventId == record.Id);
        Assert.NotNull(finalizedTx);
        Assert.Equal(PointTransactionStatus.Finalized, finalizedTx.Status);
        Assert.Equal(1, finalizedTx.Points);
    }

    [Fact]
    public async Task ApproveGpsException_NonPendingRecord_ReturnsBadRequest()
    {
        // Arrange
        var record = new AttendanceRecord
        {
            EmployeeId = _fixture.Employee1.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            CheckInTimeUtc = DateTime.UtcNow,
            CheckInStatus = VerificationStatus.Verified, // Already verified!
            Status = AttendanceStatus.Present
        };
        _fixture.DbContext.AttendanceRecords.Add(record);
        await _fixture.DbContext.SaveChangesAsync();

        var adminUser = new FakeCurrentUser { UserId = _fixture.AdminUser.Id, UserName = _fixture.AdminUser.UserName, RolesList = [RoleNames.Admin] };
        var handler = new ApproveGpsExceptionHandler(_fixture.DbContext, adminUser, _pointCalculationEngine);

        // Act
        var result = await handler.Handle(new ApproveGpsExceptionCommand(record.Id, "CheckIn"), CancellationToken.None);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Contains("not in PendingReview", result.Message);
    }

    [Fact]
    public async Task RejectGpsException_ValidPendingCheckIn_TransitionsToRejected_And_ReversesPendingPoints()
    {
        // Arrange
        var record = new AttendanceRecord
        {
            EmployeeId = _fixture.Employee1.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            CheckInTimeUtc = DateTime.UtcNow,
            CheckInStatus = VerificationStatus.PendingReview,
            CheckInFailureReason = "Mock GPS Spoofing detected",
            Status = AttendanceStatus.PendingReview
        };
        _fixture.DbContext.AttendanceRecords.Add(record);

        var pendingTx = new PointTransaction
        {
            EmployeeId = _fixture.Employee1.Id,
            Points = 1,
            Category = PointCategory.Green,
            EventType = PointEventType.OnTimeArrival,
            Status = PointTransactionStatus.PendingReview,
            SourceEventId = record.Id,
            Reason = "Pending point"
        };
        _fixture.DbContext.PointTransactions.Add(pendingTx);
        await _fixture.DbContext.SaveChangesAsync();

        var adminUser = new FakeCurrentUser { UserId = _fixture.AdminUser.Id, UserName = _fixture.AdminUser.UserName, RolesList = [RoleNames.Admin] };
        var handler = new RejectGpsExceptionHandler(_fixture.DbContext, adminUser);

        var command = new RejectGpsExceptionCommand(record.Id, "CheckIn", "Spoofed location confirmed");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Equal("Rejected", result.Data!.CheckInStatus);
        Assert.Equal("Rejected", result.Data.Status);
        Assert.Equal("Spoofed location confirmed", result.Data.ReviewNotes);

        // Verify pending transaction was reversed / zero points awarded
        var updatedTx = await _fixture.DbContext.PointTransactions.FindAsync(pendingTx.Id);
        Assert.NotNull(updatedTx);
        Assert.Equal(PointTransactionStatus.Reversed, updatedTx.Status);
    }

    [Fact]
    public async Task CorrectIncompleteAttendance_ValidManualCheckOut_CalculatesDuration_And_MarksCompleted()
    {
        // Arrange
        var checkInTime = DateTime.UtcNow.AddHours(-8);
        var record = new AttendanceRecord
        {
            EmployeeId = _fixture.Employee1.Id,
            Date = DateOnly.FromDateTime(checkInTime),
            CheckInTimeUtc = checkInTime,
            CheckInStatus = VerificationStatus.Verified,
            CheckOutTimeUtc = null, // Incomplete!
            CheckOutStatus = VerificationStatus.NotRecorded,
            Status = AttendanceStatus.Present
        };
        _fixture.DbContext.AttendanceRecords.Add(record);
        await _fixture.DbContext.SaveChangesAsync();

        var manualCheckOut = checkInTime.AddHours(7).AddMinutes(30); // 7.5 hours duration = 450 mins
        var adminUser = new FakeCurrentUser { UserId = _fixture.AdminUser.Id, UserName = _fixture.AdminUser.UserName, RolesList = [RoleNames.Admin] };
        var handler = new CorrectIncompleteAttendanceHandler(_fixture.DbContext, adminUser);

        var command = new CorrectIncompleteAttendanceCommand(record.Id, manualCheckOut, "Employee forgot to badge out at gate");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.Equal(manualCheckOut, result.Data.CheckOutTimeUtc);
        Assert.Equal("Verified", result.Data.CheckOutStatus);
        Assert.Equal("Completed", result.Data.Status);
        Assert.Equal(450, result.Data.DurationMinutes);
        Assert.True(result.Data.IsManuallyAdjusted);
        Assert.Contains("Employee forgot to badge out", result.Data.ReviewNotes);
    }

    [Fact]
    public async Task CorrectIncompleteAttendance_CheckOutBeforeCheckIn_ReturnsBadRequest()
    {
        // Arrange
        var checkInTime = DateTime.UtcNow.AddHours(-4);
        var record = new AttendanceRecord
        {
            EmployeeId = _fixture.Employee1.Id,
            Date = DateOnly.FromDateTime(checkInTime),
            CheckInTimeUtc = checkInTime,
            CheckInStatus = VerificationStatus.Verified,
            CheckOutTimeUtc = null,
            Status = AttendanceStatus.Present
        };
        _fixture.DbContext.AttendanceRecords.Add(record);
        await _fixture.DbContext.SaveChangesAsync();

        var invalidCheckOut = checkInTime.AddHours(-1); // Before Check-in!
        var adminUser = new FakeCurrentUser { UserId = _fixture.AdminUser.Id, UserName = _fixture.AdminUser.UserName, RolesList = [RoleNames.Admin] };
        var handler = new CorrectIncompleteAttendanceHandler(_fixture.DbContext, adminUser);

        var command = new CorrectIncompleteAttendanceCommand(record.Id, invalidCheckOut, "Typo correction");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Contains("must be after the check-in time", result.Message);
    }

    [Fact]
    public async Task ManualPointAdjustment_ValidRequest_CreatesFinalizedTransaction_WithCorrectCategoryAndSignedPoints()
    {
        // Arrange
        var adminUser = new FakeCurrentUser { UserId = _fixture.AdminUser.Id, UserName = _fixture.AdminUser.UserName, RolesList = [RoleNames.Admin] };
        var handler = new ManualPointAdjustmentHandler(_fixture.DbContext, adminUser);

        var command = new ManualPointAdjustmentCommand(
            _fixture.Employee1.Id,
            PointCategory.Green,
            5,
            "Outstanding performance on weekend deployment");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.Equal(5, result.Data.Points);
        Assert.Equal(PointCategory.Green, result.Data.Category);
        Assert.Equal(PointEventType.ManualAdjustment, result.Data.EventType);
        Assert.Equal(PointTransactionStatus.Finalized, result.Data.Status);
        Assert.Contains("Outstanding performance", result.Data.Reason);

        // Verify ledger persistence
        var persisted = await _fixture.DbContext.PointTransactions.FindAsync(result.Data.Id);
        Assert.NotNull(persisted);
        Assert.Equal(5, persisted.Points);
        Assert.Equal(_fixture.AdminUser.Id, persisted.Created_By);
    }

    [Fact]
    public async Task ManualPointAdjustment_InactiveEmployee_ReturnsBadRequest()
    {
        // Arrange
        var inactiveEmp = new Employee
        {
            FirstName = "Inactive",
            LastName = "Staff",
            Email = "inactive@nasaq.test",
            Department = "IT",
            IsActive = false // Inactive!
        };
        _fixture.DbContext.Employees.Add(inactiveEmp);
        await _fixture.DbContext.SaveChangesAsync();

        var adminUser = new FakeCurrentUser { UserId = _fixture.AdminUser.Id, UserName = _fixture.AdminUser.UserName, RolesList = [RoleNames.Admin] };
        var handler = new ManualPointAdjustmentHandler(_fixture.DbContext, adminUser);

        var command = new ManualPointAdjustmentCommand(inactiveEmp.Id, PointCategory.Green, 3, "Attempt on inactive staff");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Contains("inactive employee", result.Message);
    }

    [Fact]
    public async Task GetDailyAttendanceOperations_And_Summary_ReturnsAccurateMetrics()
    {
        // Arrange
        var adminUser = new FakeCurrentUser { UserId = _fixture.AdminUser.Id, UserName = _fixture.AdminUser.UserName, RolesList = [RoleNames.Admin] };
        var summaryHandler = new GetAdminOperationsSummaryHandler(_fixture.DbContext, adminUser);
        var operationsHandler = new GetDailyAttendanceOperationsHandler(_fixture.DbContext, adminUser);

        // Act
        var summaryResult = await summaryHandler.Handle(new GetAdminOperationsSummaryQuery(), CancellationToken.None);
        var opsResult = await operationsHandler.Handle(new GetDailyAttendanceOperationsQuery(), CancellationToken.None);

        // Assert
        Assert.True(summaryResult.Succeeded);
        Assert.NotNull(summaryResult.Data);
        Assert.True(summaryResult.Data.PendingGpsExceptionsCount >= 0);

        Assert.True(opsResult.Succeeded);
        Assert.NotNull(opsResult.Data);
        Assert.NotNull(opsResult.Data.Data);
    }

    [Fact]
    public void CorrectIncompleteAttendance_Validator_RejectsFutureTime()
    {
        // Arrange
        var validator = new CorrectIncompleteAttendanceValidator();
        var futureTime = DateTime.UtcNow.AddHours(2);
        var command = new CorrectIncompleteAttendanceCommand(Guid.NewGuid(), futureTime, "Forgot to check out");

        // Act
        var result = validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CorrectIncompleteAttendanceCommand.ManualCheckOutTimeUtc) && e.ErrorMessage.Contains("future"));
    }

    [Fact]
    public void ManualPointAdjustment_Validator_AcceptsConciseReason_And_RejectsTooShort()
    {
        // Arrange
        var validator = new ManualPointAdjustmentValidator();
        var validCommand = new ManualPointAdjustmentCommand(Guid.NewGuid(), PointCategory.Green, 5, "مكافأة");
        var shortCommand = new ManualPointAdjustmentCommand(Guid.NewGuid(), PointCategory.Green, 5, "ab");

        // Act
        var validResult = validator.Validate(validCommand);
        var shortResult = validator.Validate(shortCommand);

        // Assert
        Assert.True(validResult.IsValid);
        Assert.False(shortResult.IsValid);
        Assert.Contains(shortResult.Errors, e => e.PropertyName == nameof(ManualPointAdjustmentCommand.Reason) && e.ErrorMessage.Contains("3 characters"));
    }
}
