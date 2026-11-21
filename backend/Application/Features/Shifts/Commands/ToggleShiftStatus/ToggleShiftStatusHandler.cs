using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Commands.ToggleShiftStatus;

public sealed class ToggleShiftStatusHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser
) : IRequestHandler<ToggleShiftStatusCommand, GenericBaseResponse<WorkShiftDto>>
{
    public async Task<GenericBaseResponse<WorkShiftDto>> Handle(
        ToggleShiftStatusCommand request,
        CancellationToken cancellationToken)
    {
        var shift = await dbContext.WorkShifts
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (shift is null)
        {
            return GenericBaseResponse<WorkShiftDto>.Fail(
                "Work shift not found.",
                HttpStatusCode.NotFound);
        }

        shift.IsActive = request.IsActive ?? !shift.IsActive;
        shift.Updated_Utc = DateTime.UtcNow;
        shift.Updated_By = currentUser.UserId;

        await dbContext.SaveChangesAsync(cancellationToken);

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

        return GenericBaseResponse<WorkShiftDto>.Success(dto, $"Work shift status changed to {(shift.IsActive ? "active" : "inactive")}.");
    }
}
