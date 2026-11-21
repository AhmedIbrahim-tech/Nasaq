using Application.Abstractions;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Attendance.Queries.GetAttendanceRecordById;

public class GetAttendanceRecordByIdHandler : IRequestHandler<GetAttendanceRecordByIdQuery, GenericBaseResponse<AttendanceRecordDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAttendanceRecordByIdHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<AttendanceRecordDto>> Handle(
        GetAttendanceRecordByIdQuery request,
        CancellationToken cancellationToken)
    {
        var record = await _context.AttendanceRecords
            .Include(a => a.WorkLocation)
            .Include(a => a.WorkShift)
            .Include(a => a.Employee)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (record == null)
        {
            return GenericBaseResponse<AttendanceRecordDto>.NotFound($"Attendance record with ID '{request.Id}' was not found.");
        }

        return GenericBaseResponse<AttendanceRecordDto>.Success(AttendanceRecordDto.FromEntity(record));
    }
}
