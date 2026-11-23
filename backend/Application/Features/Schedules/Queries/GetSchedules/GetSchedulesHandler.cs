using Application.Common;
using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Queries.GetSchedules;

public sealed class GetSchedulesHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<GetSchedulesQuery, GenericBaseResponse<PaginationResult<WorkScheduleDto>>>
{
    public async Task<GenericBaseResponse<PaginationResult<WorkScheduleDto>>> Handle(
        GetSchedulesQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.WorkSchedules
            .Include(s => s.Days)
                .ThenInclude(d => d.Shift)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(search) ||
                                     (s.NameAr != null && s.NameAr.ToLower().Contains(search)) ||
                                     (s.Description != null && s.Description.ToLower().Contains(search)) ||
                                     (s.DescriptionAr != null && s.DescriptionAr.ToLower().Contains(search)));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(s => s.IsActive == request.IsActive.Value);
        }

        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDescending == true ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "isdefault" => request.SortDescending == true ? query.OrderByDescending(s => s.IsDefault) : query.OrderBy(s => s.IsDefault),
            "isactive" => request.SortDescending == true ? query.OrderByDescending(s => s.IsActive) : query.OrderBy(s => s.IsActive),
            _ => query.OrderByDescending(s => s.IsDefault).ThenBy(s => s.Name)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 10 : (request.PageSize > 100 ? 100 : request.PageSize);

        var schedules = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var scheduleIds = schedules.Select(s => s.Id).ToList();
        var assignmentCounts = await dbContext.EmployeeScheduleAssignments
            .Where(a => scheduleIds.Contains(a.WorkScheduleId) && a.IsActive)
            .GroupBy(a => a.WorkScheduleId)
            .Select(g => new { ScheduleId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.ScheduleId, g => g.Count, cancellationToken);

        var dtos = schedules.Select(s =>
        {
            var dayDtos = s.Days.OrderBy(d => d.DayOfWeek).Select(d => new WorkScheduleDayDto(
                d.Id,
                d.DayOfWeek,
                d.DayOfWeek.ToString(),
                d.IsWorkingDay,
                d.WorkShiftId,
                d.Shift?.Name,
                d.Shift?.StartTime,
                d.Shift?.EndTime,
                d.Shift?.IsOvernight,
                d.Shift?.DurationHours,
                d.Shift?.NameAr
            )).ToList();

            var assigned = assignmentCounts.TryGetValue(s.Id, out var count) ? count : 0;

            return new WorkScheduleDto(
                s.Id,
                s.Name,
                s.Description,
                s.IsActive,
                s.IsDefault,
                dayDtos,
                assigned,
                s.Created_Utc,
                s.Created_By,
                s.Updated_Utc,
                s.Updated_By,
                s.NameAr,
                s.DescriptionAr
            );
        }).ToList();

        var paginated = PaginationResult<WorkScheduleDto>.Success(dtos, totalCount, page, pageSize);
        return GenericBaseResponse<PaginationResult<WorkScheduleDto>>.Success(paginated);
    }
}
