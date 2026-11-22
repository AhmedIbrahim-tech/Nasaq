using Application.Abstractions;
using Application.Features.Auth.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Queries.GetPendingForgotPasswordRequests;

public class GetPendingForgotPasswordRequestsHandler : IRequestHandler<GetPendingForgotPasswordRequestsQuery, GenericBaseResponse<List<ForgotPasswordRequestDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetPendingForgotPasswordRequestsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GenericBaseResponse<List<ForgotPasswordRequestDto>>> Handle(GetPendingForgotPasswordRequestsQuery request, CancellationToken cancellationToken)
    {
        var requests = await _context.ForgotPasswordRequests
            .AsNoTracking()
            .Include(r => r.Employee)
            .Include(r => r.User)
            .Where(r => r.Status == PasswordRecoveryStatus.Pending)
            .OrderByDescending(r => r.RequestedAtUtc)
            .Select(r => new ForgotPasswordRequestDto
            {
                Id = r.Id,
                UserId = r.UserId,
                EmployeeId = r.EmployeeId,
                EmployeeName = r.Employee != null ? r.Employee.FullNameEn : r.User != null ? r.User.FullName : null,
                EmployeeNameAr = r.Employee != null ? r.Employee.FullNameAr : r.User != null ? r.User.FullNameAr : null,
                EmployeeCode = r.EmployeeCode ?? (r.Employee != null ? r.Employee.EmployeeCode : null),
                Email = r.Email,
                Status = r.Status,
                RequestedAtUtc = r.RequestedAtUtc,
                ReviewedAtUtc = r.ReviewedAtUtc,
                ReviewedBy = r.ReviewedBy,
                RejectionReason = r.RejectionReason
            })
            .ToListAsync(cancellationToken);

        return GenericBaseResponse<List<ForgotPasswordRequestDto>>.Success(requests);
    }
}
