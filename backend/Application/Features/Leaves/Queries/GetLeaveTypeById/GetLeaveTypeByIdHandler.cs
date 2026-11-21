using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Queries.GetLeaveTypeById;

public class GetLeaveTypeByIdHandler : IRequestHandler<GetLeaveTypeByIdQuery, GenericBaseResponse<LeaveTypeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLeaveTypeByIdHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<LeaveTypeDto>> Handle(
        GetLeaveTypeByIdQuery request,
        CancellationToken cancellationToken)
    {
        var leaveType = await _context.LeaveTypes
            .AsNoTracking()
            .Include(t => t.LeaveRequests)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (leaveType == null)
        {
            return GenericBaseResponse<LeaveTypeDto>.Fail("Leave type not found.", HttpStatusCode.NotFound);
        }

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
            ActiveRequestsCount = leaveType.LeaveRequests.Count(r => r.Status == Domain.Enums.LeaveRequestStatus.Pending || r.Status == Domain.Enums.LeaveRequestStatus.Approved)
        };

        return GenericBaseResponse<LeaveTypeDto>.Success(dto);
    }
}
