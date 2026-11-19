using Application.Features.Employees.Commands.CreateEmployee;
using Application.Features.Employees.Commands.ToggleEmployeeStatus;
using Application.Features.Employees.Commands.UpdateEmployee;
using Application.Features.Employees.DTOs;
using Application.Features.Employees.Queries.GetCurrentEmployeeProfile;
using Application.Features.Employees.Queries.GetEmployeeById;
using Application.Features.Employees.Queries.GetEmployees;
using Application.Features.Employees.Queries.GetSupervisors;

namespace API.Controllers;

[Authorize]
[ApiController]
public sealed class EmployeesController : ApiControllerBase
{
    [HttpGet(Router.Employees.List)]
    [Authorize(Policy = PolicyNames.RequireSupervisor)]
    public async Task<IActionResult> GetEmployees(
        [FromQuery] GetEmployeesQuery query,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(query, cancellationToken));

    [HttpGet(Router.Employees.MyProfile)]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetCurrentEmployeeProfileQuery(), cancellationToken));

    [HttpGet(Router.Employees.Supervisors)]
    [Authorize(Policy = PolicyNames.EmployeeManagement)]
    public async Task<IActionResult> GetSupervisors(CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetSupervisorsQuery(), cancellationToken));

    [HttpGet(Router.Employees.GetById)]
    [Authorize(Policy = PolicyNames.EmployeeView)]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(new GetEmployeeByIdQuery(id), cancellationToken));

    [HttpPost(Router.Employees.Create)]
    [Authorize(Policy = PolicyNames.EmployeeManagement)]
    public async Task<IActionResult> Create(
        [FromBody] CreateEmployeeCommand command,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(command, cancellationToken));

    [HttpPut(Router.Employees.Update)]
    [Authorize(Policy = PolicyNames.EmployeeManagement)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateEmployeeRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new UpdateEmployeeCommand(
            id,
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber,
            request.Department,
            request.JobTitle,
            request.HireDate,
            request.UserRole,
            request.UserId,
            request.SupervisorId);

        return ActionResult(await _mediator.Send(command, cancellationToken));
    }

    [HttpPatch(Router.Employees.ToggleStatus)]
    [Authorize(Policy = PolicyNames.EmployeeManagement)]
    public async Task<IActionResult> ToggleStatus(
        [FromRoute] Guid id,
        [FromBody] ToggleStatusRequest? request = null,
        CancellationToken cancellationToken = default) =>
        ActionResult(await _mediator.Send(
            new ToggleEmployeeStatusCommand(id, request?.IsActive),
            cancellationToken));
}
