using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Attendance.Commands.CheckIn;

public class CheckInCommand : IRequest<GenericBaseResponse<AttendanceRecordDto>>
{
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? AccuracyMeters { get; set; }
    public string? DeviceInfo { get; set; }
    public string? Notes { get; set; }
}
