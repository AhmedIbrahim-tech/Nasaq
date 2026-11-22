using Application.Abstractions;
using Application.Features.EmployeeLocations.DTOs;
using Domain.Common;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Application.Features.EmployeeLocations.Commands.UpdateGlobalGeofenceRadius;

public class UpdateGlobalGeofenceRadiusHandler : IRequestHandler<UpdateGlobalGeofenceRadiusCommand, GenericBaseResponse<GlobalGeofenceRadiusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateGlobalGeofenceRadiusHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<GlobalGeofenceRadiusDto>> Handle(UpdateGlobalGeofenceRadiusCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == "GlobalGeofenceRadiusMeters", cancellationToken);

        var utcNow = DateTime.UtcNow;

        if (setting == null)
        {
            setting = new SystemSetting
            {
                Id = Guid.NewGuid(),
                Key = "GlobalGeofenceRadiusMeters",
                Value = request.RadiusMeters.ToString("F1", CultureInfo.InvariantCulture),
                Description = "Global geofence radius in meters for all approved personal and company locations",
                Created_Utc = utcNow,
                Created_By = _currentUser.UserName ?? "Admin"
            };
            await _context.SystemSettings.AddAsync(setting, cancellationToken);
        }
        else
        {
            setting.Value = request.RadiusMeters.ToString("F1", CultureInfo.InvariantCulture);
            setting.Updated_Utc = utcNow;
            setting.Updated_By = _currentUser.UserName ?? "Admin";
        }

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<GlobalGeofenceRadiusDto>.Success(new GlobalGeofenceRadiusDto
        {
            RadiusMeters = request.RadiusMeters,
            LastUpdatedUtc = utcNow,
            UpdatedBy = _currentUser.UserName ?? "Admin"
        }, "Global geofence radius updated successfully.");
    }
}
