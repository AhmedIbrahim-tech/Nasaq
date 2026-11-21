using Application.Features.Shifts.DTOs;

namespace Application.Features.Shifts.Commands.CreateShift;

public sealed class CreateShiftHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser
) : IRequestHandler<CreateShiftCommand, GenericBaseResponse<WorkShiftDto>>
{
    public async Task<GenericBaseResponse<WorkShiftDto>> Handle(
        CreateShiftCommand request,
        CancellationToken cancellationToken)
    {
        var trimmedName = request.Name.Trim();
        var exists = await dbContext.WorkShifts
            .AnyAsync(s => s.Name == trimmedName, cancellationToken);

        if (exists)
        {
            return GenericBaseResponse<WorkShiftDto>.Fail(
                "A work shift with this name already exists.",
                HttpStatusCode.Conflict);
        }

        var isOvernight = request.IsOvernight || (request.EndTime <= request.StartTime);

        var shift = new WorkShift
        {
            Name = trimmedName,
            NameAr = request.NameAr?.Trim(),
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsOvernight = isOvernight,
            EarlyStartTime = request.EarlyStartTime,
            OnTimeStartTime = request.OnTimeStartTime ?? request.StartTime,
            LateStartTime = request.LateStartTime,
            CutoffTime = request.CutoffTime,
            Notes = request.Notes?.Trim(),
            IsActive = request.IsActive,
            Created_Utc = DateTime.UtcNow,
            Created_By = currentUser.UserId
        };

        dbContext.WorkShifts.Add(shift);
        await dbContext.SaveChangesAsync(cancellationToken);

        var dto = WorkShiftDto.FromEntity(shift);

        return GenericBaseResponse<WorkShiftDto>.Success(dto, "Work shift created successfully.", HttpStatusCode.Created);
    }
}
