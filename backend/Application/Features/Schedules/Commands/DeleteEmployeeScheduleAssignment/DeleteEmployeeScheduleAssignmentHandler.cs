namespace Application.Features.Schedules.Commands.DeleteEmployeeScheduleAssignment;

public sealed class DeleteEmployeeScheduleAssignmentHandler(
    IApplicationDbContext dbContext
) : IRequestHandler<DeleteEmployeeScheduleAssignmentCommand, GenericBaseResponse<object?>>
{
    public async Task<GenericBaseResponse<object?>> Handle(
        DeleteEmployeeScheduleAssignmentCommand request,
        CancellationToken cancellationToken)
    {
        var assignment = await dbContext.EmployeeScheduleAssignments
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (assignment is null)
        {
            return GenericBaseResponse<object?>.Fail(
                "Employee schedule assignment not found.",
                HttpStatusCode.NotFound);
        }

        dbContext.EmployeeScheduleAssignments.Remove(assignment);
        await dbContext.SaveChangesAsync(cancellationToken);

        return GenericBaseResponse<object?>.Success(null, "Employee schedule assignment deleted successfully.");
    }
}
