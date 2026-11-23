using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Commands.UpdateShift;

public sealed class UpdateShiftHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser
) : IRequestHandler<UpdateShiftCommand, GenericBaseResponse<WorkShiftDto>>
{
    public async Task<GenericBaseResponse<WorkShiftDto>> Handle(
        UpdateShiftCommand request,
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

        var nameAr = !string.IsNullOrWhiteSpace(request.NameAr) ? request.NameAr.Trim() : null;
        var nameEn = !string.IsNullOrWhiteSpace(request.NameEn)
            ? request.NameEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Name) ? request.Name.Trim() : (nameAr ?? string.Empty));
        var trimmedName = nameEn;

        var nameExists = await dbContext.WorkShifts
            .AnyAsync(s => s.Id != request.Id &&
                           ((s.Name == trimmedName) ||
                            (nameAr != null && s.NameAr != null && s.NameAr == nameAr)),
                      cancellationToken);

        if (nameExists)
        {
            return GenericBaseResponse<WorkShiftDto>.Fail(
                "Another work shift with this name already exists.",
                HttpStatusCode.Conflict);
        }

        var isOvernight = request.IsOvernight || (request.EndTime <= request.StartTime);

        shift.Name = trimmedName;
        shift.NameAr = nameAr;
        shift.StartTime = request.StartTime;
        shift.EndTime = request.EndTime;
        shift.IsOvernight = isOvernight;
        shift.EarlyStartTime = request.EarlyStartTime;
        shift.OnTimeStartTime = request.OnTimeStartTime ?? request.StartTime;
        shift.LateStartTime = request.LateStartTime;
        shift.CutoffTime = request.CutoffTime;
        shift.Notes = request.Notes?.Trim();
        shift.IsActive = request.IsActive;
        shift.Updated_Utc = DateTime.UtcNow;
        shift.Updated_By = currentUser.UserId;

        await dbContext.SaveChangesAsync(cancellationToken);

        var dto = WorkShiftDto.FromEntity(shift);

        return GenericBaseResponse<WorkShiftDto>.Success(dto, "Work shift updated successfully.");
    }
}
