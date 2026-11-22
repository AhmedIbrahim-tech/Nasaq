using Application.Abstractions;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.EmployeeLocations.Commands.UpdateCompanyLocationCoordinates;

public class UpdateCompanyLocationCoordinatesHandler : IRequestHandler<UpdateCompanyLocationCoordinatesCommand, GenericBaseResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateCompanyLocationCoordinatesHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<bool>> Handle(UpdateCompanyLocationCoordinatesCommand request, CancellationToken cancellationToken)
    {
        var location = await _context.WorkLocations
            .FirstOrDefaultAsync(w => w.Id == request.LocationId, cancellationToken);

        if (location == null)
            return GenericBaseResponse<bool>.NotFound("Company work location not found.");

        location.Latitude = request.Latitude;
        location.Longitude = request.Longitude;
        location.Updated_Utc = DateTime.UtcNow;
        location.Updated_By = _currentUser.UserName ?? "Admin";

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<bool>.Success(true, "Company location coordinates updated successfully.");
    }
}
