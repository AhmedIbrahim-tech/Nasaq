using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Queries.GetShiftById;

public sealed class GetShiftByIdHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<GetShiftByIdQuery, GenericBaseResponse<WorkShiftDto>>
{
    public async Task<GenericBaseResponse<WorkShiftDto>> Handle(
        GetShiftByIdQuery request,
        CancellationToken cancellationToken)
    {
        var shift = await dbContext.WorkShifts
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (shift is null)
        {
            return GenericBaseResponse<WorkShiftDto>.Fail(
                "Work shift not found.",
                HttpStatusCode.NotFound);
        }

        var dto = new WorkShiftDto(
            shift.Id,
            shift.Name,
            shift.StartTime,
            shift.EndTime,
            shift.IsOvernight,
            shift.DurationHours,
            shift.EarlyStartTime,
            shift.OnTimeStartTime,
            shift.LateStartTime,
            shift.CutoffTime,
            shift.Notes,
            shift.IsActive,
            shift.Created_Utc,
            shift.Created_By,
            shift.Updated_Utc,
            shift.Updated_By
        );

        return GenericBaseResponse<WorkShiftDto>.Success(dto);
    }
}
