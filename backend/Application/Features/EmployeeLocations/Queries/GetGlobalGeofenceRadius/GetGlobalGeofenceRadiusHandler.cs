using Application.Abstractions;
using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Application.Features.EmployeeLocations.Queries.GetGlobalGeofenceRadius;

public class GetGlobalGeofenceRadiusHandler : IRequestHandler<GetGlobalGeofenceRadiusQuery, GenericBaseResponse<GlobalGeofenceRadiusDto>>
{
    private readonly IApplicationDbContext _context;

    public GetGlobalGeofenceRadiusHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<GlobalGeofenceRadiusDto>> Handle(GetGlobalGeofenceRadiusQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == "GlobalGeofenceRadiusMeters", cancellationToken);

        double radius = 50.0;
        if (setting != null && double.TryParse(setting.Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed) && parsed > 0)
        {
            radius = parsed;
        }

        return GenericBaseResponse<GlobalGeofenceRadiusDto>.Success(new GlobalGeofenceRadiusDto
        {
            RadiusMeters = radius,
            LastUpdatedUtc = setting?.Updated_Utc ?? setting?.Created_Utc,
            UpdatedBy = setting?.Updated_By ?? setting?.Created_By
        });
    }
}
