using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Commands.ToggleLeaveTypeStatus;

public class ToggleLeaveTypeStatusHandler : IRequestHandler<ToggleLeaveTypeStatusCommand, GenericBaseResponse<LeaveTypeDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleLeaveTypeStatusHandler(IApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<GenericBaseResponse<LeaveTypeDto>> Handle(
        ToggleLeaveTypeStatusCommand request,
        CancellationToken cancellationToken)
    {
        var leaveType = await _context.LeaveTypes
            .Include(t => t.LeaveRequests)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (leaveType == null)
        {
            return GenericBaseResponse<LeaveTypeDto>.Fail("Leave type not found.", HttpStatusCode.NotFound);
        }

        leaveType.IsActive = !leaveType.IsActive;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new LeaveTypeDto
        {
            Id = leaveType.Id,
            Name = leaveType.Name,
            NameAr = leaveType.NameAr,
            Code = leaveType.Code,
            Description = leaveType.Description,
            IsPaid = leaveType.IsPaid,
            RequiresAttachment = leaveType.RequiresAttachment,
            DefaultDaysPerYear = leaveType.DefaultDaysPerYear,
            IsActive = leaveType.IsActive,
            ActiveRequestsCount = leaveType.LeaveRequests.Count
        };

        var message = leaveType.IsActive ? "Leave type activated successfully." : "Leave type deactivated successfully.";
        return GenericBaseResponse<LeaveTypeDto>.Success(dto, message);
    }
}
