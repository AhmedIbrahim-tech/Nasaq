using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Leaves.Queries.GetLeaveTypes;

public class GetLeaveTypesHandler : IRequestHandler<GetLeaveTypesQuery, GenericBaseResponse<List<LeaveTypeDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetLeaveTypesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<List<LeaveTypeDto>>> Handle(
        GetLeaveTypesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.LeaveTypes
            .AsNoTracking()
            .Include(t => t.LeaveRequests);

        var list = await (request.ActiveOnly ? query.Where(t => t.IsActive) : query)
            .OrderBy(t => t.Name)
            .Select(t => new LeaveTypeDto
            {
                Id = t.Id,
                Name = t.Name,
                NameAr = t.NameAr,
                Code = t.Code,
                Description = t.Description,
                DescriptionAr = t.DescriptionAr,
                IsPaid = t.IsPaid,
                RequiresAttachment = t.RequiresAttachment,
                DefaultDaysPerYear = t.DefaultDaysPerYear,
                IsActive = t.IsActive,
                ActiveRequestsCount = t.LeaveRequests.Count(r => r.Status == Domain.Enums.LeaveRequestStatus.Pending || r.Status == Domain.Enums.LeaveRequestStatus.Approved)
            })
            .ToListAsync(cancellationToken);

        return GenericBaseResponse<List<LeaveTypeDto>>.Success(list);
    }
}
