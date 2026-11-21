using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Tests.Points;

public class PointCalculationEngineTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly PointCalculationEngine _engine;

    public PointCalculationEngineTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "PointsTestDb_" + Guid.NewGuid().ToString("N"))
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _engine = new PointCalculationEngine(_dbContext);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task EvaluateAttendanceEventAsync_OnTimeArrival_AwardsGreenPoints()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var rule = new PointRule
        {
            Id = Guid.NewGuid(),
            Name = "On Time Check-in Bonus",
            Category = PointCategory.Green,
            EventType = PointEventType.OnTimeArrival,
            Points = 10,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10))
        };
        _dbContext.PointRules.Add(rule);
        await _dbContext.SaveChangesAsync();

        var attendance = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ArrivalClassification = ArrivalClassification.OnTime,
            Status = AttendanceStatus.Present,
            CheckInStatus = VerificationStatus.Verified
        };

        // Act
        var transactions = await _engine.EvaluateAttendanceEventAsync(attendance);

        // Assert
        Assert.Single(transactions);
        var tx = transactions[0];
        Assert.Equal(rule.Id, tx.RuleId);
        Assert.Equal(10, tx.Points);
        Assert.Equal(PointCategory.Green, tx.Category);
        Assert.Equal(PointTransactionStatus.Finalized, tx.Status);
    }

    [Fact]
    public async Task EvaluateAttendanceEventAsync_LateArrival_AppliesRedPoints()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
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
        await _dbContext.SaveChangesAsync();

        var attendance = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ArrivalClassification = ArrivalClassification.Late,
            Status = AttendanceStatus.Present,
            CheckInStatus = VerificationStatus.Verified
        };

        // Act
        var transactions = await _engine.EvaluateAttendanceEventAsync(attendance);

        // Assert
        Assert.Single(transactions);
        var tx = transactions[0];
        Assert.Equal(PointCategory.Red, tx.Category);
        Assert.Equal(5, tx.Points);
        Assert.Equal(PointTransactionStatus.Finalized, tx.Status);
    }

    [Fact]
    public async Task EvaluateAttendanceEventAsync_PendingReviewAttendance_GeneratesPendingReviewPoints()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var rule = new PointRule
        {
            Id = Guid.NewGuid(),
            Name = "On Time Check-in Bonus",
            Category = PointCategory.Green,
            EventType = PointEventType.OnTimeArrival,
            Points = 10,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10))
        };
        _dbContext.PointRules.Add(rule);
        await _dbContext.SaveChangesAsync();

        var attendance = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ArrivalClassification = ArrivalClassification.OnTime,
            Status = AttendanceStatus.PendingReview, // GPS outside geofence!
            CheckInStatus = VerificationStatus.PendingReview
        };

        // Act
        var transactions = await _engine.EvaluateAttendanceEventAsync(attendance);

        // Assert
        Assert.Single(transactions);
        var tx = transactions[0];
        Assert.Equal(PointTransactionStatus.PendingReview, tx.Status);
    }

    [Fact]
    public async Task EvaluateAttendanceEventAsync_Idempotency_DoesNotGenerateDuplicates()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var rule = new PointRule
        {
            Id = Guid.NewGuid(),
            Name = "On Time Check-in Bonus",
            Category = PointCategory.Green,
            EventType = PointEventType.OnTimeArrival,
            Points = 10,
            IsActive = true,
            EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10))
        };
        _dbContext.PointRules.Add(rule);

        var attendance = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ArrivalClassification = ArrivalClassification.OnTime,
            Status = AttendanceStatus.Present,
            CheckInStatus = VerificationStatus.Verified
        };

        // Add already existing transaction for this attendance event
        var existingTx = new PointTransaction
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            RuleId = rule.Id,
            SourceEventId = attendance.Id,
            EventType = PointEventType.OnTimeArrival,
            Category = PointCategory.Green,
            Points = 10,
            Status = PointTransactionStatus.Finalized,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            TimestampUtc = DateTime.UtcNow
        };
        _dbContext.PointTransactions.Add(existingTx);
        await _dbContext.SaveChangesAsync();

        // Act: Run evaluation again
        var transactions = await _engine.EvaluateAttendanceEventAsync(attendance);

        // Assert: Idempotent - zero duplicates generated!
        Assert.Empty(transactions);
    }
}
