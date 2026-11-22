using Application.Abstractions;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.EmployeeLocations.Commands.ResetEmployeeLocation;

public class ResetEmployeeLocationHandler : IRequestHandler<ResetEmployeeLocationCommand, GenericBaseResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ResetEmployeeLocationHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<bool>> Handle(ResetEmployeeLocationCommand request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId, cancellationToken);

        if (employee == null)
            return GenericBaseResponse<bool>.NotFound("Employee not found.");

        var utcNow = DateTime.UtcNow;

        // Atomically deactivate active locations
        var activeLocations = await _context.EmployeePersonalLocations
            .Where(l => l.EmployeeId == employee.Id && l.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var l in activeLocations)
        {
            l.IsActive = false;
            l.Updated_Utc = utcNow;
            l.Updated_By = _currentUser.UserName ?? "Admin";
        }

        // Atomically supersede pending requests
        var pendingRequests = await _context.EmployeeLocationRequests
            .Where(r => r.EmployeeId == employee.Id && r.Status == LocationRequestStatus.Pending)
            .ToListAsync(cancellationToken);

        foreach (var pr in pendingRequests)
        {
            pr.Status = LocationRequestStatus.Superseded;
            pr.ReviewedAtUtc = utcNow;
            pr.ReviewedBy = _currentUser.UserName ?? "Admin";
            pr.AdminNotes = request.Reason ?? "Superseded by admin location reset";
            pr.Updated_Utc = utcNow;
            pr.Updated_By = _currentUser.UserName ?? "Admin";
        }

        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<bool>.Success(true, "Employee approved location reset successfully.");
    }
}
