using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Tests.Schedules;

public class ShiftResolutionTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ShiftResolutionService _service;

    public ShiftResolutionTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "ShiftTestDb_" + Guid.NewGuid().ToString("N"))
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _service = new ShiftResolutionService(_dbContext);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task ResolveShift_StandardDayShift_ResolvesOnTimeArrival()
    {
        // Arrange
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP001",
            FirstName = "Ahmed",
            LastName = "Ali",
            Email = "ahmed@nasaq.test",
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);

        var shift = new WorkShift
        {
            Id = Guid.NewGuid(),
            Name = "Morning Shift",
            StartTime = new TimeOnly(8, 0),
            EndTime = new TimeOnly(17, 0),
            EarlyStartTime = new TimeOnly(7, 30),
            OnTimeStartTime = new TimeOnly(8, 15),
            LateStartTime = new TimeOnly(8, 30),
            CutoffTime = new TimeOnly(9, 0),
            IsOvernight = false,
            IsActive = true
        };
        _dbContext.WorkShifts.Add(shift);

        // Schedule on Sunday
        var schedule = new WorkSchedule
        {
            Id = Guid.NewGuid(),
            Name = "Standard Week",
            IsDefault = true,
            IsActive = true,
            Days = new List<WorkScheduleDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = DayOfWeek.Sunday,
                    IsWorkingDay = true,
                    WorkShiftId = shift.Id,
                    Shift = shift
                }
            }
        };
        _dbContext.WorkSchedules.Add(schedule);
        await _dbContext.SaveChangesAsync();

        // 2026-11-22 is a Sunday. Check in at 08:05 UTC (within 15 min grace)
        var checkInUtc = new DateTime(2026, 11, 22, 8, 5, 0, DateTimeKind.Utc);

        // Act
        var result = await _service.ResolveShiftForCheckInAsync(employee, checkInUtc);

        // Assert
        Assert.NotNull(result.Shift);
        Assert.Equal("Morning Shift", result.Shift.Name);
        Assert.Equal(ArrivalClassification.OnTime, result.Classification);
        Assert.True(result.IsScheduledWorkDay);
    }

    [Fact]
    public async Task ResolveShift_OffDay_ReturnsNotScheduledWorkDay()
    {
        // Arrange
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP002",
            FirstName = "Sara",
            LastName = "Khaled",
            Email = "sara@nasaq.test",
            HireDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        _dbContext.Employees.Add(employee);

        var schedule = new WorkSchedule
        {
            Id = Guid.NewGuid(),
            Name = "Standard Week",
            IsDefault = true,
            IsActive = true,
            Days = new List<WorkScheduleDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = DayOfWeek.Friday,
                    IsWorkingDay = false // Off day
                }
            }
        };
        _dbContext.WorkSchedules.Add(schedule);
        await _dbContext.SaveChangesAsync();

        // 2026-11-20 is a Friday
        var checkInUtc = new DateTime(2026, 11, 20, 10, 0, 0, DateTimeKind.Utc);

        // Act
        var result = await _service.ResolveShiftForCheckInAsync(employee, checkInUtc);

        // Assert
        Assert.Null(result.Shift);
        Assert.False(result.IsScheduledWorkDay);
    }
}
