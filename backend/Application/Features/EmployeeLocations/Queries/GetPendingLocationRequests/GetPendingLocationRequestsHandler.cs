using Application.Abstractions;
using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.EmployeeLocations.Queries.GetPendingLocationRequests;

public class GetPendingLocationRequestsHandler : IRequestHandler<GetPendingLocationRequestsQuery, GenericBaseResponse<List<EmployeeLocationRequestDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetPendingLocationRequestsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<List<EmployeeLocationRequestDto>>> Handle(GetPendingLocationRequestsQuery request, CancellationToken cancellationToken)
    {
        var requests = await _context.EmployeeLocationRequests
            .AsNoTracking()
            .Include(r => r.Employee)
            .Where(r => r.Status == LocationRequestStatus.Pending)
            .OrderByDescending(r => r.Created_Utc)
            .Select(r => new EmployeeLocationRequestDto
            {
                Id = r.Id,
                EmployeeId = r.EmployeeId,
                EmployeeName = r.Employee != null ? r.Employee.FullNameEn : null,
                EmployeeNameAr = r.Employee != null ? r.Employee.FullNameAr : null,
                EmployeeCode = r.Employee != null ? r.Employee.EmployeeCode : null,
                RequestType = r.RequestType,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                AccuracyMeters = r.AccuracyMeters,
                AddressDescription = r.AddressDescription,
                Status = r.Status,
                Created_Utc = r.Created_Utc
            })
            .ToListAsync(cancellationToken);

        return GenericBaseResponse<List<EmployeeLocationRequestDto>>.Success(requests);
    }
}
