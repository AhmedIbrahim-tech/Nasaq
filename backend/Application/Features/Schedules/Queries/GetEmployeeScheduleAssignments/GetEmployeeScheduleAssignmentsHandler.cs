using Application.Common;
using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Queries.GetEmployeeScheduleAssignments;

public sealed class GetEmployeeScheduleAssignmentsHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<GetEmployeeScheduleAssignmentsQuery, GenericBaseResponse<PaginationResult<EmployeeScheduleAssignmentDto>>>
{
    public async Task<GenericBaseResponse<PaginationResult<EmployeeScheduleAssignmentDto>>> Handle(
        GetEmployeeScheduleAssignmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.EmployeeScheduleAssignments
            .Include(a => a.Employee)
            .Include(a => a.Schedule)
            .AsNoTracking()
            .AsQueryable();

        if (request.WorkScheduleId.HasValue)
        {
            query = query.Where(a => a.WorkScheduleId == request.WorkScheduleId.Value);
        }

        if (request.EmployeeId.HasValue)
        {
            query = query.Where(a => a.EmployeeId == request.EmployeeId.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(a => a.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(a =>
                (a.Employee != null && (
                    a.Employee.FirstName.ToLower().Contains(search) ||
                    a.Employee.LastName.ToLower().Contains(search) ||
                    a.Employee.EmployeeCode.ToLower().Contains(search)
                )) ||
                (a.Schedule != null && a.Schedule.Name.ToLower().Contains(search)));
        }

        query = query.OrderByDescending(a => a.EffectiveFrom);

        var totalCount = await query.CountAsync(cancellationToken);
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 10 : (request.PageSize > 100 ? 100 : request.PageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new EmployeeScheduleAssignmentDto(
                a.Id,
                a.EmployeeId,
                a.Employee != null ? a.Employee.EmployeeCode : string.Empty,
                a.Employee != null ? a.Employee.FullName : string.Empty,
                a.Employee != null ? a.Employee.Department : null,
                a.WorkScheduleId,
                a.Schedule != null ? a.Schedule.Name : string.Empty,
                a.EffectiveFrom,
                a.EffectiveTo,
                a.IsActive,
                a.Notes,
                a.Created_Utc,
                a.Created_By,
                a.Employee != null ? a.Employee.FullNameAr : null,
                a.Employee != null ? a.Employee.DepartmentAr : null,
                a.Schedule != null ? a.Schedule.NameAr : null
            ))
            .ToListAsync(cancellationToken);

        var paginated = PaginationResult<EmployeeScheduleAssignmentDto>.Success(items, totalCount, page, pageSize);
        return GenericBaseResponse<PaginationResult<EmployeeScheduleAssignmentDto>>.Success(paginated);
    }
}
