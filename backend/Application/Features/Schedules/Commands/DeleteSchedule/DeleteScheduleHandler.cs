namespace Application.Features.Schedules.Commands.DeleteSchedule;

public sealed class DeleteScheduleHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<DeleteScheduleCommand, GenericBaseResponse<object?>>
{
    public async Task<GenericBaseResponse<object?>> Handle(
        DeleteScheduleCommand request,
        CancellationToken cancellationToken)
    {
        var schedule = await dbContext.WorkSchedules
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (schedule is null)
        {
            return GenericBaseResponse<object?>.Fail(
                "Work schedule not found.",
                HttpStatusCode.NotFound);
        }

        var hasActiveAssignments = await dbContext.EmployeeScheduleAssignments
            .AnyAsync(a => a.WorkScheduleId == request.Id && a.IsActive, cancellationToken);

        if (hasActiveAssignments)
        {
            return GenericBaseResponse<object?>.Fail(
                "Cannot delete this schedule because it is currently assigned to one or more active employees. Please deactivate it or reassign employees first.",
                HttpStatusCode.Conflict);
        }

        dbContext.WorkSchedules.Remove(schedule);
        await dbContext.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<object?>.Success(null, "Work schedule deleted successfully.");
    }
}
