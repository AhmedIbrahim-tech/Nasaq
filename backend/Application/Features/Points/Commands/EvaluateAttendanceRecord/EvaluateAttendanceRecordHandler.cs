using Application.Abstractions;
using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Commands.EvaluateAttendanceRecord;

public class EvaluateAttendanceRecordHandler : IRequestHandler<EvaluateAttendanceRecordCommand, GenericBaseResponse<List<PointTransactionDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPointCalculationEngine _calculationEngine;

    public EvaluateAttendanceRecordHandler(
        IApplicationDbContext context,
        IPointCalculationEngine calculationEngine)
    {
        _context = context;
        _calculationEngine = calculationEngine;
    }

    public async Task<GenericBaseResponse<List<PointTransactionDto>>> Handle(
        EvaluateAttendanceRecordCommand request,
        CancellationToken cancellationToken)
    {
        var attendance = await _context.AttendanceRecords
            .Include(a => a.Employee)
            .Include(a => a.WorkShift)
            .FirstOrDefaultAsync(a => a.Id == request.AttendanceRecordId, cancellationToken);

        if (attendance == null)
        {
            return GenericBaseResponse<List<PointTransactionDto>>.NotFound(
                $"Attendance record with ID '{request.AttendanceRecordId}' was not found.");
        }

        var transactions = await _calculationEngine.EvaluateAttendanceEventAsync(attendance, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dtos = transactions.Select(PointTransactionDto.FromEntity).ToList();
        return GenericBaseResponse<List<PointTransactionDto>>.Success(dtos, $"Evaluated and generated {dtos.Count} point transaction(s).");
    }
}
