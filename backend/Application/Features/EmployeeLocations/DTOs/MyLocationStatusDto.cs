using Domain.Enums;

namespace Application.Features.EmployeeLocations.DTOs;

public class MyLocationStatusDto
{
    public EmployeePersonalLocationDto? ApprovedLocation { get; set; }
    public EmployeeLocationRequestDto? PendingRequest { get; set; }
    public EmployeeLocationRequestDto? LastRejectedRequest { get; set; }
    public bool HasApprovedLocation => ApprovedLocation != null && ApprovedLocation.IsActive && ApprovedLocation.IsApproved;
    public bool HasPendingRequest => PendingRequest != null && PendingRequest.Status == LocationRequestStatus.Pending;
}
