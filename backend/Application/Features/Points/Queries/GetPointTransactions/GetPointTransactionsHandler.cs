using System.Net;
using Application.Abstractions;
using Application.Common;
using Application.Features.Points.DTOs;
using Domain.Authorization;
using Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Points.Queries.GetPointTransactions;

public class GetPointTransactionsHandler : IRequestHandler<GetPointTransactionsQuery, GenericBaseResponse<PaginationResult<PointTransactionDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPointTransactionsHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GenericBaseResponse<PaginationResult<PointTransactionDto>>> Handle(
        GetPointTransactionsQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.UserId))
        {
            return GenericBaseResponse<PaginationResult<PointTransactionDto>>.Unauthorized();
        }

        var isSuperAdmin = _currentUser.Roles.Contains(RoleNames.SuperAdmin);
        var isAdmin = _currentUser.Roles.Contains(RoleNames.Admin);
        var isSupervisor = _currentUser.Roles.Contains(RoleNames.Supervisor);

        var query = _context.PointTransactions
            .Include(t => t.Rule)
            .Include(t => t.Employee)
            .AsNoTracking();

        // Supervisor scoping
        if (isSupervisor && !isAdmin && !isSuperAdmin)
        {
            var supervisorEmployee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId, cancellationToken);

            if (supervisorEmployee == null)
            {
                return GenericBaseResponse<PaginationResult<PointTransactionDto>>.Fail(
                    "Supervisor employee record not found.", HttpStatusCode.Forbidden);
            }

            query = query.Where(t => t.Employee != null && t.Employee.SupervisorId == supervisorEmployee.Id);
        }

        if (request.EmployeeId.HasValue)
        {
            query = query.Where(t => t.EmployeeId == request.EmployeeId.Value);
        }

        if (request.Category.HasValue)
        {
            query = query.Where(t => t.Category == request.Category.Value);
        }

        if (request.EventType.HasValue)
        {
            query = query.Where(t => t.EventType == request.EventType.Value);
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
