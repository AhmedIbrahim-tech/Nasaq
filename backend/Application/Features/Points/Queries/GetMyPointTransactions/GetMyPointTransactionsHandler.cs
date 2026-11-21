using System.Net;
using Application.Abstractions;
using Application.Common;
using Application.Features.Points.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Queries.GetMyPointTransactions;

public class GetMyPointTransactionsHandler : IRequestHandler<GetMyPointTransactionsQuery, GenericBaseResponse<PaginationResult<PointTransactionDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyPointTransactionsHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<PaginationResult<PointTransactionDto>>> Handle(
        GetMyPointTransactionsQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<PaginationResult<PointTransactionDto>>.Unauthorized();
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId && e.IsActive, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<PaginationResult<PointTransactionDto>>.Fail("No active employee profile associated with the current user.", HttpStatusCode.Forbidden);
        }

        var query = _context.PointTransactions
            .Include(t => t.Rule)
            .Include(t => t.Employee)
            .Where(t => t.EmployeeId == employee.Id)
            .AsNoTracking();

        if (request.Category.HasValue)
        {
            query = query.Where(t => t.Category == request.Category.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(t => t.Status == request.Status.Value);
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(t => t.Date >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(t => t.Date <= request.EndDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(t => t.TimestampUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(PointTransactionDto.FromEntity).ToList();
        var result = PaginationResult<PointTransactionDto>.Success(dtos, totalCount, page, pageSize);

        return GenericBaseResponse<PaginationResult<PointTransactionDto>>.Success(result);
    }
}
