using Domain.DTOs.Auth;

namespace Tests;

public class AuthorizationTests : IAsyncLifetime
{
    private readonly TestFixture _fixture = new();

    public async Task InitializeAsync()
    {
        await _fixture.InitializeAsync();
    }

    public Task DisposeAsync()
    {
        _fixture.Dispose();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task Scenario1_Admin_Can_Assign_Supervisor()
    {
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var handler = new UpdateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fixture.FileService,
            adminContext,
            _fixture.UserManager,
            _fixture.RoleManager);

        var command = new UpdateEmployeeCommand(
            Id: _fixture.UnassignedEmp.Id,
            FirstName: _fixture.UnassignedEmp.FirstName,
            LastName: _fixture.UnassignedEmp.LastName,
            Email: _fixture.UnassignedEmp.Email,
            PhoneNumber: null,
            Department: _fixture.UnassignedEmp.Department,
            JobTitle: null,
            HireDate: _fixture.UnassignedEmp.HireDate,
            UserRole: null,
            UserId: null,
            SupervisorId: _fixture.SupervisorAEmp.Id);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded, response.Message);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(response.Data);
        Assert.Equal(_fixture.SupervisorAEmp.Id, response.Data.SupervisorId);
        Assert.Equal(_fixture.SupervisorAEmp.FullName, response.Data.SupervisorName);

        var updated = await _fixture.DbContext.Employees.FindAsync(_fixture.UnassignedEmp.Id);
        Assert.NotNull(updated);
        Assert.Equal(_fixture.SupervisorAEmp.Id, updated.SupervisorId);
    }

    [Fact]
    public async Task Scenario2_SuperAdmin_Can_Assign_Supervisor()
    {
        var superAdminContext = _fixture.CreateUserContext(_fixture.SuperAdminUser, RoleNames.SuperAdmin);
        var handler = new CreateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fixture.FileService,
            superAdminContext,
            _fixture.UserManager,
            _fixture.RoleManager,
            _fixture.PasswordService);

        var command = new CreateEmployeeCommand(
            EmployeeCode: "EMP-NEW-01",
            FirstName: "New",
            LastName: "Recruit",
            Email: "recruit@nasaq.test",
            PhoneNumber: null,
            Department: "Editing",
            JobTitle: "Editor",
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            UserRole: null,
            Password: null,
            UserId: null,
            SupervisorId: _fixture.SupervisorBEmp.Id);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded, response.Message);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Data);
        Assert.Equal(_fixture.SupervisorBEmp.Id, response.Data.SupervisorId);
        Assert.Equal(_fixture.SupervisorBEmp.FullName, response.Data.SupervisorName);

        var created = await _fixture.DbContext.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-NEW-01");
        Assert.NotNull(created);
        Assert.Equal(_fixture.SupervisorBEmp.Id, created.SupervisorId);
    }

    [Fact]
    public async Task Scenario3_Supervisor_Cannot_Change_Supervisor_Assignment()
    {
        var supervisorContext = _fixture.CreateUserContext(_fixture.SupervisorAUser, RoleNames.Supervisor);
        var updateHandler = new UpdateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fixture.FileService,
            supervisorContext,
            _fixture.UserManager,
            _fixture.RoleManager);

        var updateCommand = new UpdateEmployeeCommand(
            Id: _fixture.Employee1.Id,
            FirstName: _fixture.Employee1.FirstName,
            LastName: _fixture.Employee1.LastName,
            Email: _fixture.Employee1.Email,
            PhoneNumber: null,
            Department: _fixture.Employee1.Department,
            JobTitle: null,
            HireDate: _fixture.Employee1.HireDate,
            UserRole: null,
            UserId: null,
            SupervisorId: _fixture.SupervisorBEmp.Id);

        var updateResponse = await updateHandler.Handle(updateCommand, CancellationToken.None);

        Assert.False(updateResponse.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, updateResponse.StatusCode);
        Assert.Contains("Only SuperAdmin and Admin can assign or change an employee's supervisor", updateResponse.Message);

        var createHandler = new CreateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fixture.FileService,
            supervisorContext,
            _fixture.UserManager,
            _fixture.RoleManager,
            _fixture.PasswordService);

        var createCommand = new CreateEmployeeCommand(
            EmployeeCode: "EMP-ILLEGAL-01",
            FirstName: "Illegal",
            LastName: "Create",
            Email: "illegal@nasaq.test",
            PhoneNumber: null,
            Department: "Photography",
            JobTitle: null,
            HireDate: DateTime.UtcNow.Date,
            CreateUserAccount: false,
            UserRole: null,
            Password: null,
            UserId: null,
            SupervisorId: _fixture.SupervisorAEmp.Id);

        var createResponse = await createHandler.Handle(createCommand, CancellationToken.None);
        Assert.False(createResponse.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, createResponse.StatusCode);
    }

    [Fact]
    public async Task Scenario4_Employee_Cannot_Change_Supervisor_Assignment()
    {
        var employeeContext = _fixture.CreateUserContext(_fixture.Employee1User, RoleNames.Employee);
        var updateHandler = new UpdateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fixture.FileService,
            employeeContext,
            _fixture.UserManager,
            _fixture.RoleManager);

        var updateCommand = new UpdateEmployeeCommand(
            Id: _fixture.Employee1.Id,
            FirstName: _fixture.Employee1.FirstName,
            LastName: _fixture.Employee1.LastName,
            Email: _fixture.Employee1.Email,
            PhoneNumber: null,
            Department: _fixture.Employee1.Department,
            JobTitle: null,
            HireDate: _fixture.Employee1.HireDate,
            UserRole: null,
            UserId: null,
            SupervisorId: _fixture.SupervisorBEmp.Id);

        var updateResponse = await updateHandler.Handle(updateCommand, CancellationToken.None);

        Assert.False(updateResponse.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, updateResponse.StatusCode);
        Assert.Contains("Only SuperAdmin and Admin can assign or change an employee's supervisor", updateResponse.Message);
    }

    [Fact]
    public async Task Scenario5_Supervisor_Cannot_Access_Unassigned_Employees()
    {
        var supervisorContext = _fixture.CreateUserContext(_fixture.SupervisorAUser, RoleNames.Supervisor);

        var listHandler = new GetEmployeesHandler(_fixture.DbContext, supervisorContext);
        var listResponse = await listHandler.Handle(new GetEmployeesQuery { Page = 1, PageSize = 50 }, CancellationToken.None);

        Assert.True(listResponse.Succeeded);
        Assert.NotNull(listResponse.Data);
        Assert.DoesNotContain(listResponse.Data.Data, e => e.Id == _fixture.UnassignedEmp.Id);

        var detailsHandler = new GetEmployeeByIdHandler(_fixture.DbContext, supervisorContext, _fixture.UserManager);
        var detailsResponse = await detailsHandler.Handle(new GetEmployeeByIdQuery(_fixture.UnassignedEmp.Id), CancellationToken.None);

        Assert.False(detailsResponse.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, detailsResponse.StatusCode);
        Assert.Contains("Access denied: You can only view details of your directly assigned employees", detailsResponse.Message);
    }

    [Fact]
    public async Task Scenario6_Supervisor_Cannot_Access_Another_Supervisors_Employees()
    {
        var supervisorAContext = _fixture.CreateUserContext(_fixture.SupervisorAUser, RoleNames.Supervisor);

        var listHandler = new GetEmployeesHandler(_fixture.DbContext, supervisorAContext);
        var listResponse = await listHandler.Handle(new GetEmployeesQuery { Page = 1, PageSize = 50 }, CancellationToken.None);

        Assert.True(listResponse.Succeeded);
        Assert.NotNull(listResponse.Data);
        Assert.Contains(listResponse.Data.Data, e => e.Id == _fixture.Employee1.Id);
        Assert.DoesNotContain(listResponse.Data.Data, e => e.Id == _fixture.Employee2.Id);

        var detailsHandler = new GetEmployeeByIdHandler(_fixture.DbContext, supervisorAContext, _fixture.UserManager);
        var detailsResponse = await detailsHandler.Handle(new GetEmployeeByIdQuery(_fixture.Employee2.Id), CancellationToken.None);

        Assert.False(detailsResponse.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, detailsResponse.StatusCode);
        Assert.Contains("Access denied", detailsResponse.Message);
    }

    [Fact]
    public async Task Scenario7_Changing_Assignment_Updates_Access_Immediately()
    {
        var supervisorAContext = _fixture.CreateUserContext(_fixture.SupervisorAUser, RoleNames.Supervisor);
        var supervisorBContext = _fixture.CreateUserContext(_fixture.SupervisorBUser, RoleNames.Supervisor);
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);

        var detailsHandlerA = new GetEmployeeByIdHandler(_fixture.DbContext, supervisorAContext, _fixture.UserManager);
        var detailsHandlerB = new GetEmployeeByIdHandler(_fixture.DbContext, supervisorBContext, _fixture.UserManager);
        var listHandlerA = new GetEmployeesHandler(_fixture.DbContext, supervisorAContext);
        var listHandlerB = new GetEmployeesHandler(_fixture.DbContext, supervisorBContext);

        var initialA = await detailsHandlerA.Handle(new GetEmployeeByIdQuery(_fixture.Employee1.Id), CancellationToken.None);
        Assert.True(initialA.Succeeded);

        var initialB = await detailsHandlerB.Handle(new GetEmployeeByIdQuery(_fixture.Employee1.Id), CancellationToken.None);
        Assert.False(initialB.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, initialB.StatusCode);

        var updateHandler = new UpdateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fixture.FileService,
            adminContext,
            _fixture.UserManager,
            _fixture.RoleManager);

        var reassignCommand = new UpdateEmployeeCommand(
            Id: _fixture.Employee1.Id,
            FirstName: _fixture.Employee1.FirstName,
            LastName: _fixture.Employee1.LastName,
            Email: _fixture.Employee1.Email,
            PhoneNumber: null,
            Department: _fixture.Employee1.Department,
            JobTitle: null,
            HireDate: _fixture.Employee1.HireDate,
            UserRole: null,
            UserId: null,
            SupervisorId: _fixture.SupervisorBEmp.Id);

        var reassignResult = await updateHandler.Handle(reassignCommand, CancellationToken.None);
        Assert.True(reassignResult.Succeeded);

        var afterA = await detailsHandlerA.Handle(new GetEmployeeByIdQuery(_fixture.Employee1.Id), CancellationToken.None);
        Assert.False(afterA.Succeeded);
        Assert.Equal(HttpStatusCode.Forbidden, afterA.StatusCode);

        var listAAfter = await listHandlerA.Handle(new GetEmployeesQuery { Page = 1, PageSize = 50 }, CancellationToken.None);
        Assert.DoesNotContain(listAAfter.Data!.Data, e => e.Id == _fixture.Employee1.Id);

        var afterB = await detailsHandlerB.Handle(new GetEmployeeByIdQuery(_fixture.Employee1.Id), CancellationToken.None);
        Assert.True(afterB.Succeeded);
        Assert.Equal(HttpStatusCode.OK, afterB.StatusCode);

        var listBAfter = await listHandlerB.Handle(new GetEmployeesQuery { Page = 1, PageSize = 50 }, CancellationToken.None);
        Assert.Contains(listBAfter.Data!.Data, e => e.Id == _fixture.Employee1.Id);
    }

    [Fact]
    public async Task Scenario8_Employees_Without_Supervisors_Remain_Inaccessible()
    {
        var supervisorAContext = _fixture.CreateUserContext(_fixture.SupervisorAUser, RoleNames.Supervisor);
        var supervisorBContext = _fixture.CreateUserContext(_fixture.SupervisorBUser, RoleNames.Supervisor);

        var listHandlerA = new GetEmployeesHandler(_fixture.DbContext, supervisorAContext);
        var listA = await listHandlerA.Handle(new GetEmployeesQuery { Page = 1, PageSize = 100 }, CancellationToken.None);
        Assert.DoesNotContain(listA.Data!.Data, e => e.SupervisorId == null);

        var detailsHandlerA = new GetEmployeeByIdHandler(_fixture.DbContext, supervisorAContext, _fixture.UserManager);
        var detailsA = await detailsHandlerA.Handle(new GetEmployeeByIdQuery(_fixture.UnassignedEmp.Id), CancellationToken.None);
        Assert.Equal(HttpStatusCode.Forbidden, detailsA.StatusCode);

        var listHandlerB = new GetEmployeesHandler(_fixture.DbContext, supervisorBContext);
        var listB = await listHandlerB.Handle(new GetEmployeesQuery { Page = 1, PageSize = 100 }, CancellationToken.None);
        Assert.DoesNotContain(listB.Data!.Data, e => e.SupervisorId == null);

        var detailsHandlerB = new GetEmployeeByIdHandler(_fixture.DbContext, supervisorBContext, _fixture.UserManager);
        var detailsB = await detailsHandlerB.Handle(new GetEmployeeByIdQuery(_fixture.UnassignedEmp.Id), CancellationToken.None);
        Assert.Equal(HttpStatusCode.Forbidden, detailsB.StatusCode);
    }

    [Fact]
    public async Task Scenario9_Self_Supervision_Is_Strictly_Prohibited()
    {
        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var handler = new UpdateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fixture.FileService,
            adminContext,
            _fixture.UserManager,
            _fixture.RoleManager);

        var command = new UpdateEmployeeCommand(
            Id: _fixture.SupervisorAEmp.Id,
            FirstName: _fixture.SupervisorAEmp.FirstName,
            LastName: _fixture.SupervisorAEmp.LastName,
            Email: _fixture.SupervisorAEmp.Email,
            PhoneNumber: null,
            Department: _fixture.SupervisorAEmp.Department,
            JobTitle: null,
            HireDate: _fixture.SupervisorAEmp.HireDate,
            UserRole: null,
            UserId: null,
            SupervisorId: _fixture.SupervisorAEmp.Id);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("cannot be assigned as their own supervisor", response.Message);
    }

    [Fact]
    public async Task Scenario10_Inactive_Employee_Cannot_Be_Assigned_As_Supervisor()
    {
        _fixture.SupervisorAEmp.IsActive = false;
        await _fixture.DbContext.SaveChangesAsync();

        var adminContext = _fixture.CreateUserContext(_fixture.AdminUser, RoleNames.Admin);
        var handler = new UpdateEmployeeHandler(
            _fixture.DbContext,
            _fixture.UnitOfWork,
            _fixture.FileService,
            adminContext,
            _fixture.UserManager,
            _fixture.RoleManager);

        var command = new UpdateEmployeeCommand(
            Id: _fixture.Employee2.Id,
            FirstName: _fixture.Employee2.FirstName,
            LastName: _fixture.Employee2.LastName,
            Email: _fixture.Employee2.Email,
            PhoneNumber: null,
            Department: _fixture.Employee2.Department,
            JobTitle: null,
            HireDate: _fixture.Employee2.HireDate,
            UserRole: null,
            UserId: null,
            SupervisorId: _fixture.SupervisorAEmp.Id);

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Cannot assign an inactive employee as a supervisor", response.Message);
    }

    [Fact]
    public async Task Scenario12_UpdateProfile_SynchronizesUserAndEmployee_Successfully()
    {
        var authService = new AuthService(
            _fixture.UserManager,
            null!,
            null!,
            null!,
            Options.Create(new JwtSettings()),
            _fixture.DbContext);

        var request = new UpdateProfileRequest
        {
            FullName = "Sarah Updated",
            PhoneNumber = "+966512345678",
            JobTitle = "Senior Analyst",
            Department = "Information Technology"
        };

        var response = await authService.UpdateProfileAsync(_fixture.Employee1User.Id, request, CancellationToken.None);

        Assert.True(response.Succeeded);
        Assert.NotNull(response.Data);
        Assert.Equal("Sarah Updated", response.Data.FullName);
        Assert.Equal("+966512345678", response.Data.PhoneNumber);
        Assert.Equal("Senior Analyst", response.Data.JobTitle);
        Assert.Equal("Information Technology", response.Data.Department);

        // Verify ApplicationUser persistence
        var user = await _fixture.UserManager.FindByIdAsync(_fixture.Employee1User.Id);
        Assert.NotNull(user);
        Assert.Equal("Sarah Updated", user.FullName);
        Assert.Equal("+966512345678", user.PhoneNumber);
        Assert.Equal("Senior Analyst", user.JobTitle);
        Assert.Equal("Information Technology", user.Department);

        // Verify linked Employee persistence
        var employee = await _fixture.DbContext.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
        Assert.NotNull(employee);
        Assert.Equal("Sarah", employee.FirstName);
        Assert.Equal("Updated", employee.LastName);
        Assert.Equal("+966512345678", employee.PhoneNumber);
        Assert.Equal("Senior Analyst", employee.JobTitle);
        Assert.Equal("Information Technology", employee.Department);
    }
}
