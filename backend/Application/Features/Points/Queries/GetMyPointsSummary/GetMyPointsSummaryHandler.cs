using System.Net;
using Application.Abstractions;
using Application.Features.Points.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Queries.GetMyPointsSummary;

public class GetMyPointsSummaryHandler : IRequestHandler<GetMyPointsSummaryQuery, GenericBaseResponse<EmployeePointsSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyPointsSummaryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<EmployeePointsSummaryDto>> Handle(
        GetMyPointsSummaryQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<EmployeePointsSummaryDto>.Unauthorized();
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<EmployeePointsSummaryDto>.Fail("No active employee profile associated with the current user.", HttpStatusCode.Forbidden);
        }

        var transactions = await _context.PointTransactions
            .Include(t => t.Rule)
            .Where(t => t.EmployeeId == employee.Id)
            .OrderByDescending(t => t.TimestampUtc)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var finalized = transactions.Where(t => t.Status == PointTransactionStatus.Finalized).ToList();
        var pending = transactions.Where(t => t.Status == PointTransactionStatus.PendingReview).ToList();

        var totalFinalized = finalized.Sum(t => t.Points);
        var greenTotal = finalized.Where(t => t.Category == PointCategory.Green).Sum(t => t.Points);
        var redTotal = finalized.Where(t => t.Category == PointCategory.Red).Sum(t => t.Points);
        var blackTotal = finalized.Where(t => t.Category == PointCategory.Black).Sum(t => t.Points);
        var pendingTotal = pending.Sum(t => t.Points);

        var recentDtos = transactions
            .Take(10)
            .Select(PointTransactionDto.FromEntity)
            .ToList();

        var summary = new EmployeePointsSummaryDto(
            EmployeeId: employee.Id,
            EmployeeName: employee.FullName,
            TotalFinalizedPoints: totalFinalized,
            GreenPoints: greenTotal,
            RedPoints: redTotal,
            BlackPoints: blackTotal,
            PendingPoints: pendingTotal,
            RecentTransactions: recentDtos
        );

        return GenericBaseResponse<EmployeePointsSummaryDto>.Success(summary);
    }
}
