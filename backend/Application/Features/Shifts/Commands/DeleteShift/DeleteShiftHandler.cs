namespace Application.Features.Shifts.Commands.DeleteShift;

public sealed class DeleteShiftHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<DeleteShiftCommand, GenericBaseResponse<object?>>
{
    public async Task<GenericBaseResponse<object?>> Handle(
        DeleteShiftCommand request,
        CancellationToken cancellationToken)
    {
        var shift = await dbContext.WorkShifts
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (shift is null)
        {
            return GenericBaseResponse<object?>.Fail(
                "Work shift not found.",
                HttpStatusCode.NotFound);
        }

        var isUsedInSchedules = await dbContext.WorkScheduleDays
            .AnyAsync(d => d.WorkShiftId == request.Id, cancellationToken);

        if (isUsedInSchedules)
        {
            return GenericBaseResponse<object?>.Fail(
                "Cannot delete this shift because it is assigned to one or more work schedules. Please deactivate it instead.",
                HttpStatusCode.Conflict);
        }

        dbContext.WorkShifts.Remove(shift);
        await dbContext.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<object?>.Success(null, "Work shift deleted successfully.");
    }
}
