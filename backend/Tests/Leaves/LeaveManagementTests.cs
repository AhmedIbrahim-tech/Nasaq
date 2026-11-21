using Application.Abstractions;
using Application.Features.Leaves.Commands.ApproveLeaveRequest;
using Application.Features.Leaves.Commands.CancelLeaveRequest;
using Application.Features.Leaves.Commands.CreateLeaveType;
using Application.Features.Leaves.Commands.RejectLeaveRequest;
using Application.Features.Leaves.Commands.SubmitLeaveRequest;
using Application.Features.Leaves.Commands.ToggleLeaveTypeStatus;
using Application.Features.Leaves.Commands.UpdateLeaveType;
using Application.Features.Leaves.Queries.GetLeaveSummary;
using Application.Features.Leaves.Queries.GetLeaveTypes;
using Domain.Authorization;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using System.Net;
using Tests.Fakes;
using Xunit;

namespace Tests.Leaves;

public class LeaveManagementTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly LeaveService _leaveService;
    private readonly FakeNotificationService _notificationService;

    public LeaveManagementTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "LeaveTests_" + Guid.NewGuid().ToString("N"))
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _unitOfWork = new UnitOfWork(_dbContext, NullLogger<UnitOfWork>.Instance);
        _leaveService = new LeaveService(_dbContext);
        _notificationService = new FakeNotificationService();
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task LeaveType_Create_Update_Toggle_WorksAndEnforcesUniqueCode()
    {
        // 1. Create Leave Type
        var createCmd = new CreateLeaveTypeCommand
        {
            Name = "Annual Vacation",
            NameAr = "إجازة سنوية",
            Code = "ANNUAL",
            Description = "Regular paid vacation",
            IsPaid = true,
            RequiresAttachment = false,
            DefaultDaysPerYear = 30
        };

        var createHandler = new CreateLeaveTypeHandler(_dbContext, _unitOfWork);
        var createResult = await createHandler.Handle(createCmd, CancellationToken.None);

        Assert.True(createResult.Succeeded);
        Assert.NotNull(createResult.Data);
        Assert.Equal("ANNUAL", createResult.Data.Code);
        Assert.True(createResult.Data.IsActive);

        // 2. Enforce Unique Code
        var dupCmd = new CreateLeaveTypeCommand
        {
            Name = "Duplicate Annual",
            NameAr = "سنوية مكررة",
            Code = "annual", // case-insensitive duplicate check
            Description = null,
            IsPaid = true,
            RequiresAttachment = false,
            DefaultDaysPerYear = null
        };

        var dupResult = await createHandler.Handle(dupCmd, CancellationToken.None);
        Assert.False(dupResult.Succeeded);
        Assert.Equal(HttpStatusCode.Conflict, dupResult.StatusCode);

        // 3. Update Leave Type
        var updateCmd = new UpdateLeaveTypeCommand
        {
            Id = createResult.Data.Id,
            Name = "Updated Annual",
            NameAr = "سنوية محدثة",
            Description = "Updated desc",
            IsPaid = true,
            RequiresAttachment = true,
            DefaultDaysPerYear = 25
        };

        var updateHandler = new UpdateLeaveTypeHandler(_dbContext, _unitOfWork);
        var updateResult = await updateHandler.Handle(updateCmd, CancellationToken.None);

        Assert.True(updateResult.Succeeded);
        Assert.Equal("Updated Annual", updateResult.Data!.Name);
        Assert.Equal(25, updateResult.Data.DefaultDaysPerYear);
        Assert.True(updateResult.Data.RequiresAttachment);

        // 4. Toggle Status (Active -> Inactive)
        var toggleHandler = new ToggleLeaveTypeStatusHandler(_dbContext, _unitOfWork);
        var toggleResult = await toggleHandler.Handle(new ToggleLeaveTypeStatusCommand(createResult.Data.Id), CancellationToken.None);

        Assert.True(toggleResult.Succeeded);
        Assert.False(toggleResult.Data!.IsActive);

        // 5. Query active types
        var getHandler = new GetLeaveTypesHandler(_dbContext);
        var activeTypes = await getHandler.Handle(new GetLeaveTypesQuery(ActiveOnly: true), CancellationToken.None);
        Assert.DoesNotContain(activeTypes.Data!, t => t.Id == createResult.Data.Id);

        var allTypes = await getHandler.Handle(new GetLeaveTypesQuery(ActiveOnly: false), CancellationToken.None);
        Assert.Contains(allTypes.Data!, t => t.Id == createResult.Data.Id);
    }

    [Fact]
    public async Task LeaveRequest_Submit_CalculatesDaysCorrectly_And_PreventsOverlap()
    {
        // 1. Setup Employee
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-001",
            FirstName = "Ahmed",
            LastName = "Ali",
            Email = "ahmed@nasaq.test",
            UserId = "user-ahmed",
            IsActive = true
        };
        await _dbContext.Employees.AddAsync(employee);

        // Setup Leave Type
        var leaveType = new LeaveType
        {
            Id = Guid.NewGuid(),
            Name = "Sick Leave",
            NameAr = "إجازة مرضية",
            Code = "SICK",
            IsActive = true,
            IsPaid = true,
            RequiresAttachment = false
        };
        await _dbContext.LeaveTypes.AddAsync(leaveType);
        await _unitOfWork.SaveChangesAsync();

        var currentUser = new FakeCurrentUser
        {
            UserId = "user-ahmed",
            UserName = "ahmed@nasaq.test",
            RolesList = new() { RoleNames.Employee }
        };

        var submitHandler = new SubmitLeaveRequestHandler(
            _dbContext,
            _unitOfWork,
            currentUser,
            _leaveService,
            null!, // FileService not used when attachment is null
            _notificationService);

        // Submit Jan 10 to Jan 14 (5 days)
        var startDate = new DateOnly(2026, 1, 10);
        var endDate = new DateOnly(2026, 1, 14);

        var submitCmd = new SubmitLeaveRequestCommand
        {
            LeaveTypeId = leaveType.Id,
            StartDate = startDate,
            EndDate = endDate,
            Reason = "Flu recovery",
            Attachment = null
        };

        var result = await submitHandler.Handle(submitCmd, CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.Equal(5, result.Data.DaysCount);
        Assert.Equal("Pending", result.Data.Status);
        Assert.Equal("user-ahmed", currentUser.UserId);

        // 2. Overlap Check: Submitting Jan 12 to Jan 16 should fail with Conflict
        var overlapCmd = new SubmitLeaveRequestCommand
        {
            LeaveTypeId = leaveType.Id,
            StartDate = new DateOnly(2026, 1, 12),
            EndDate = new DateOnly(2026, 1, 16),
            Reason = "Second request",
            Attachment = null
        };

        var overlapResult = await submitHandler.Handle(overlapCmd, CancellationToken.None);
        Assert.False(overlapResult.Succeeded);
        Assert.Equal(HttpStatusCode.Conflict, overlapResult.StatusCode);
    }

    [Fact]
    public async Task LeaveRequest_Cancel_OnlyAllowedForPendingAndOwnEmployee()
    {
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-002",
            FirstName = "Sarah",
            LastName = "Hassan",
            Email = "sarah@nasaq.test",
            UserId = "user-sarah",
            IsActive = true
        };
        await _dbContext.Employees.AddAsync(employee);

        var leaveType = new LeaveType
        {
            Id = Guid.NewGuid(),
            Name = "Annual",
            NameAr = "سنوية",
            Code = "ANNUAL_TEST",
            IsActive = true
        };
        await _dbContext.LeaveTypes.AddAsync(leaveType);

        var leaveRequest = new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = new DateOnly(2026, 2, 1),
            EndDate = new DateOnly(2026, 2, 5),
            DaysCount = 5,
            Status = LeaveRequestStatus.Pending,
            SubmittedAtUtc = DateTime.UtcNow
        };
        await _dbContext.LeaveRequests.AddAsync(leaveRequest);
        await _unitOfWork.SaveChangesAsync();

        // 1. Another user cannot cancel Sarah's leave
        var otherUser = new FakeCurrentUser
        {
            UserId = "user-other",
            UserName = "other@nasaq.test",
            RolesList = new() { RoleNames.Employee }
        };
        var cancelHandlerOther = new CancelLeaveRequestHandler(_dbContext, _unitOfWork, otherUser, _notificationService);
        var failResult = await cancelHandlerOther.Handle(new CancelLeaveRequestCommand(leaveRequest.Id, "Cancel reason"), CancellationToken.None);
        Assert.False(failResult.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, failResult.StatusCode);

        // 2. Sarah cancels her own pending request
        var sarahUser = new FakeCurrentUser
        {
            UserId = "user-sarah",
            UserName = "sarah@nasaq.test",
            RolesList = new() { RoleNames.Employee }
        };
        var cancelHandlerSarah = new CancelLeaveRequestHandler(_dbContext, _unitOfWork, sarahUser, _notificationService);
        var successResult = await cancelHandlerSarah.Handle(new CancelLeaveRequestCommand(leaveRequest.Id, "Plans changed"), CancellationToken.None);
        Assert.True(successResult.Succeeded);
        Assert.Equal("Cancelled", successResult.Data!.Status);

        // 3. Cancelling an already cancelled request should fail
        var secondCancel = await cancelHandlerSarah.Handle(new CancelLeaveRequestCommand(leaveRequest.Id, "Cancel again"), CancellationToken.None);
        Assert.False(secondCancel.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, secondCancel.StatusCode);
    }

    [Fact]
    public async Task LeaveRequest_Approve_And_Reject_WithSupervisorScopingAndSelfApprovalSafeguards()
    {
        // Setup Supervisor & Direct Subordinate
        var supervisor = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "SUP-001",
            FirstName = "Super",
            LastName = "Visor",
            Email = "sup@nasaq.test",
            UserId = "user-sup",
            IsActive = true
        };
        await _dbContext.Employees.AddAsync(supervisor);

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-003",
            FirstName = "Karim",
            LastName = "Nader",
            Email = "karim@nasaq.test",
            UserId = "user-karim",
            SupervisorId = supervisor.Id,
            IsActive = true
        };
        await _dbContext.Employees.AddAsync(employee);

        var leaveType = new LeaveType
        {
            Id = Guid.NewGuid(),
            Name = "Emergency",
            NameAr = "طارئة",
            Code = "EMERGENCY_TEST",
            IsActive = true
        };
        await _dbContext.LeaveTypes.AddAsync(leaveType);

        var leaveRequest = new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = new DateOnly(2026, 3, 1),
            EndDate = new DateOnly(2026, 3, 3),
            DaysCount = 3,
            Status = LeaveRequestStatus.Pending,
            SubmittedAtUtc = DateTime.UtcNow
        };
        await _dbContext.LeaveRequests.AddAsync(leaveRequest);
        await _unitOfWork.SaveChangesAsync();

        // 1. Self-approval safeguard: Karim tries to approve his own request
        var karimUser = new FakeCurrentUser
        {
            UserId = "user-karim",
            UserName = "karim@nasaq.test",
            RolesList = new() { RoleNames.Supervisor } // even if user is supervisor
        };
        var approveHandler = new ApproveLeaveRequestHandler(_dbContext, _unitOfWork, karimUser, _notificationService);
        var selfApproveResult = await approveHandler.Handle(new ApproveLeaveRequestCommand(leaveRequest.Id, "Approved myself"), CancellationToken.None);
        Assert.False(selfApproveResult.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, selfApproveResult.StatusCode);

        // 2. Unassigned supervisor tries to approve (Supervisor X who is not Karim's supervisor)
        var otherSup = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "SUP-002",
            FirstName = "Other",
            LastName = "Supervisor",
            Email = "othersup@nasaq.test",
            UserId = "user-othersup",
            IsActive = true
        };
        await _dbContext.Employees.AddAsync(otherSup);
        await _unitOfWork.SaveChangesAsync();

        var otherSupUser = new FakeCurrentUser
        {
            UserId = "user-othersup",
            UserName = "othersup@nasaq.test",
            RolesList = new() { RoleNames.Supervisor }
        };
        var otherSupApproveHandler = new ApproveLeaveRequestHandler(_dbContext, _unitOfWork, otherSupUser, _notificationService);
        var wrongSupResult = await otherSupApproveHandler.Handle(new ApproveLeaveRequestCommand(leaveRequest.Id, "Wrong supervisor"), CancellationToken.None);
        Assert.False(wrongSupResult.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, wrongSupResult.StatusCode);

        // 3. Karim's real supervisor approves
        var supervisorUser = new FakeCurrentUser
        {
            UserId = "user-sup",
            UserName = "sup@nasaq.test",
            RolesList = new() { RoleNames.Supervisor }
        };
        var validApproveHandler = new ApproveLeaveRequestHandler(_dbContext, _unitOfWork, supervisorUser, _notificationService);
        var approveResult = await validApproveHandler.Handle(new ApproveLeaveRequestCommand(leaveRequest.Id, "Approved, take care"), CancellationToken.None);
        Assert.True(approveResult.Succeeded);
        Assert.Equal("Approved", approveResult.Data!.Status);
        Assert.Equal("Approved, take care", approveResult.Data.ReviewNotes);
        Assert.Single(approveResult.Data.ApprovalHistory);
        Assert.Equal("Approved", approveResult.Data.ApprovalHistory[0].Action);

        // 4. Verify LeaveService recognizes approved leave on date
        var onLeave = await _leaveService.IsOnApprovedLeaveAsync(employee.Id, new DateOnly(2026, 3, 2));
        Assert.True(onLeave);

        var notOnLeave = await _leaveService.IsOnApprovedLeaveAsync(employee.Id, new DateOnly(2026, 3, 10));
        Assert.False(notOnLeave);

        // 5. Test Rejection flow on another pending request
        var secondRequest = new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = new DateOnly(2026, 4, 1),
            EndDate = new DateOnly(2026, 4, 2),
            DaysCount = 2,
            Status = LeaveRequestStatus.Pending,
            SubmittedAtUtc = DateTime.UtcNow
        };
        await _dbContext.LeaveRequests.AddAsync(secondRequest);
        await _unitOfWork.SaveChangesAsync();

        var rejectHandler = new RejectLeaveRequestHandler(_dbContext, _unitOfWork, supervisorUser, _notificationService);
        var rejectResult = await rejectHandler.Handle(new RejectLeaveRequestCommand(secondRequest.Id, "Critical shift coverage required"), CancellationToken.None);
        Assert.True(rejectResult.Succeeded);
        Assert.Equal("Rejected", rejectResult.Data!.Status);
        Assert.Equal("Critical shift coverage required", rejectResult.Data.ReviewNotes);
    }

    [Fact]
    public async Task LeaveSummary_ComputesAccurateCounts()
    {
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeCode = "EMP-004",
            FirstName = "Tarek",
            LastName = "Hany",
            Email = "tarek@nasaq.test",
            UserId = "user-tarek",
            IsActive = true
        };
        await _dbContext.Employees.AddAsync(employee);

        var leaveType = new LeaveType
        {
            Id = Guid.NewGuid(),
            Name = "Annual",
            NameAr = "سنوية",
            Code = "ANN_SUMM",
            DefaultDaysPerYear = 30,
            IsActive = true
        };
        await _dbContext.LeaveTypes.AddAsync(leaveType);

        // 1 approved request (5 days)
        await _dbContext.LeaveRequests.AddAsync(new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = new DateOnly(2026, 5, 1),
            EndDate = new DateOnly(2026, 5, 5),
            DaysCount = 5,
            Status = LeaveRequestStatus.Approved,
            SubmittedAtUtc = DateTime.UtcNow
        });

        // 1 pending request (3 days)
        await _dbContext.LeaveRequests.AddAsync(new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = new DateOnly(2026, 6, 1),
            EndDate = new DateOnly(2026, 6, 3),
            DaysCount = 3,
            Status = LeaveRequestStatus.Pending,
            SubmittedAtUtc = DateTime.UtcNow
        });

        // 1 rejected request (2 days)
        await _dbContext.LeaveRequests.AddAsync(new LeaveRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            LeaveTypeId = leaveType.Id,
            StartDate = new DateOnly(2026, 7, 1),
            EndDate = new DateOnly(2026, 7, 2),
            DaysCount = 2,
            Status = LeaveRequestStatus.Rejected,
            SubmittedAtUtc = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();

        var userWithEmployee = new FakeCurrentUser
        {
            UserId = "user-tarek",
            UserName = "tarek@nasaq.test",
            RolesList = new() { RoleNames.Employee }
        };

        var summaryHandler = new GetLeaveSummaryHandler(_dbContext, userWithEmployee);
        var summary = await summaryHandler.Handle(new GetLeaveSummaryQuery(), CancellationToken.None);

        Assert.True(summary.Succeeded);
        Assert.NotNull(summary.Data);
        Assert.Equal(1, summary.Data.TotalPending);
        Assert.Equal(1, summary.Data.TotalApproved);
        Assert.Equal(1, summary.Data.TotalRejected);
        Assert.Equal(1, summary.Data.MyPendingCount);
        Assert.Equal(5, summary.Data.MyApprovedDaysThisYear);
    }
}
