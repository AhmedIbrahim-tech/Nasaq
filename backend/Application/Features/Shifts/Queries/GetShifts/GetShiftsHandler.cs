using Application.Common;
using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Queries.GetShifts;

public sealed class GetShiftsHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<GetShiftsQuery, GenericBaseResponse<PaginationResult<WorkShiftDto>>>
{
    public async Task<GenericBaseResponse<PaginationResult<WorkShiftDto>>> Handle(
        GetShiftsQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.WorkShifts.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(search) || (s.Notes != null && s.Notes.ToLower().Contains(search)));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(s => s.IsActive == request.IsActive.Value);
        }

        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDescending == true ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "starttime" => request.SortDescending == true ? query.OrderByDescending(s => s.StartTime) : query.OrderBy(s => s.StartTime),
            "endtime" => request.SortDescending == true ? query.OrderByDescending(s => s.EndTime) : query.OrderBy(s => s.EndTime),
            "isovernight" => request.SortDescending == true ? query.OrderByDescending(s => s.IsOvernight) : query.OrderBy(s => s.IsOvernight),
            "isactive" => request.SortDescending == true ? query.OrderByDescending(s => s.IsActive) : query.OrderBy(s => s.IsActive),
            _ => query.OrderBy(s => s.StartTime)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 10 : (request.PageSize > 100 ? 100 : request.PageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new WorkShiftDto(
                s.Id,
                s.Name,
                s.StartTime,
                s.EndTime,
                s.IsOvernight,
                s.DurationHours,
                s.EarlyStartTime,
                s.OnTimeStartTime,
                s.LateStartTime,
                s.CutoffTime,
                s.Notes,
                s.IsActive,
                s.Created_Utc,
                s.Created_By,
                s.Updated_Utc,
                s.Updated_By
            ))
            .ToListAsync(cancellationToken);

        var paginated = PaginationResult<WorkShiftDto>.Success(items, totalCount, page, pageSize);
        return GenericBaseResponse<PaginationResult<WorkShiftDto>>.Success(paginated);
    }
}
