using System.Net;
using Application.Abstractions;
using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.AdminOperations.Commands.ManualPointAdjustment;

public class ManualPointAdjustmentHandler : IRequestHandler<ManualPointAdjustmentCommand, GenericBaseResponse<PointTransactionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ManualPointAdjustmentHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<PointTransactionDto>> Handle(
        ManualPointAdjustmentCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<PointTransactionDto>.Unauthorized();
        }

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<PointTransactionDto>.Fail("Employee not found.", HttpStatusCode.NotFound);
        }

        if (!employee.IsActive)
        {
            return GenericBaseResponse<PointTransactionDto>.Fail("Cannot perform point adjustment on an inactive employee.", HttpStatusCode.BadRequest);
        }

        var eventType = PointEventType.ManualAdjustment;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var reviewerName = !string.IsNullOrWhiteSpace(_currentUser.UserName)
            ? _currentUser.UserName
            : _currentUser.UserId;

        var transaction = new PointTransaction
        {
            EmployeeId = request.EmployeeId,
            Category = request.Category,
            EventType = eventType,
            Points = request.Points,
            Status = PointTransactionStatus.Finalized,
            SourceEventType = "AdminManualAdjustment",
            Date = today,
            TimestampUtc = DateTime.UtcNow,
            Reason = $"Manual adjustment by {reviewerName}: {request.Reason.Trim()}",
            Created_Utc = DateTime.UtcNow,
            Created_By = _currentUser.UserId
        };

        _context.PointTransactions.Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        // Fetch employee details to map DTO accurately
        var loaded = await _context.PointTransactions
            .Include(t => t.Employee)
            .Include(t => t.Rule)
            .FirstOrDefaultAsync(t => t.Id == transaction.Id, cancellationToken);

        return GenericBaseResponse<PointTransactionDto>.Success(
            PointTransactionDto.FromEntity(loaded ?? transaction),
            "Manual point adjustment applied successfully.");
    }
}
