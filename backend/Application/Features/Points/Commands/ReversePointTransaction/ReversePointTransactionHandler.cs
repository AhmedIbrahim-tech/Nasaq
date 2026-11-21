using Application.Abstractions;
using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Commands.ReversePointTransaction;

public class ReversePointTransactionHandler : IRequestHandler<ReversePointTransactionCommand, GenericBaseResponse<PointTransactionDto>>
{
    private readonly IApplicationDbContext _context;

    public ReversePointTransactionHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<PointTransactionDto>> Handle(
        ReversePointTransactionCommand request,
        CancellationToken cancellationToken)
    {
        var transaction = await _context.PointTransactions
            .Include(t => t.Employee)
            .Include(t => t.Rule)
            .FirstOrDefaultAsync(t => t.Id == request.TransactionId, cancellationToken);

        if (transaction == null)
        {
            return GenericBaseResponse<PointTransactionDto>.NotFound($"Point transaction with ID '{request.TransactionId}' was not found.");
        }

        if (transaction.Status == PointTransactionStatus.Reversed)
        {
            return GenericBaseResponse<PointTransactionDto>.Conflict("This point transaction has already been reversed.");
        }

        // 1. Mark original transaction as Reversed
        transaction.Status = PointTransactionStatus.Reversed;

        // 2. Create offsetting reversal ledger transaction
        var reversalEntry = new PointTransaction
        {
            EmployeeId = transaction.EmployeeId,
            RuleId = transaction.RuleId,
            Category = transaction.Category,
            EventType = transaction.EventType,
            Points = -transaction.Points,
            Status = PointTransactionStatus.Finalized,
            SourceEventType = "TransactionReversal",
            SourceEventId = transaction.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            TimestampUtc = DateTime.UtcNow,
            Reason = $"Reversal of tx {transaction.Id}: {request.Reason.Trim()}",
            RelatedTransactionId = transaction.Id
        };

        _context.PointTransactions.Add(reversalEntry);
        await _context.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<PointTransactionDto>.Success(
            PointTransactionDto.FromEntity(reversalEntry),
            "Point transaction reversed successfully.");
    }
}
