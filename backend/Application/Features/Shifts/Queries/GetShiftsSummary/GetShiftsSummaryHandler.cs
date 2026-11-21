using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Queries.GetShiftsSummary;

public sealed class GetShiftsSummaryHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<GetShiftsSummaryQuery, GenericBaseResponse<ShiftsSummaryDto>>
{
    public async Task<GenericBaseResponse<ShiftsSummaryDto>> Handle(
        GetShiftsSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var shifts = await dbContext.WorkShifts
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var total = shifts.Count;
        var active = shifts.Count(s => s.IsActive);
        var inactive = total - active;
        var overnight = shifts.Count(s => s.IsOvernight);
        var dayShifts = total - overnight;

        var summary = new ShiftsSummaryDto(total, active, inactive, overnight, dayShifts);
        return GenericBaseResponse<ShiftsSummaryDto>.Success(summary);
    }
}
