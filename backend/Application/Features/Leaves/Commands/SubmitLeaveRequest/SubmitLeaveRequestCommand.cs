using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Features.Leaves.Commands.SubmitLeaveRequest;

public record SubmitLeaveRequestCommand : IRequest<GenericBaseResponse<LeaveRequestDto>>
{
    /// <summary>
    /// Optional: Only Admin / SuperAdmin can specify another EmployeeId.
    /// Regular employees will have their identity resolved strictly server-side.
    /// </summary>
    public Guid? EmployeeId { get; init; }

    public Guid LeaveTypeId { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public string? Reason { get; init; }

    /// <summary>
    /// Optional physical file attachment (medical note, certificate, etc.)
    /// </summary>
    public IFormFile? Attachment { get; init; }
}
