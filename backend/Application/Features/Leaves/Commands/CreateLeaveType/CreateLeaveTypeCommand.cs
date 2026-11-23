using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Leaves.Commands.CreateLeaveType;

public record CreateLeaveTypeCommand : IRequest<GenericBaseResponse<LeaveTypeDto>>
{
    public string Name { get; init; } = string.Empty;
    public string? NameAr { get; init; }
    public string? NameEn { get; init; }
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? DescriptionAr { get; init; }
    public string? DescriptionEn { get; init; }
    public bool IsPaid { get; init; } = true;
    public bool RequiresAttachment { get; init; } = false;
    public int? DefaultDaysPerYear { get; init; }
}
