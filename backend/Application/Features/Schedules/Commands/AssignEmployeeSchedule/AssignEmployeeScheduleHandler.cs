using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Commands.AssignEmployeeSchedule;

public sealed class AssignEmployeeScheduleHandler(
    IApplicationDbContext dbContext,
    ICurrentUser currentUser
) : IRequestHandler<AssignEmployeeScheduleCommand, GenericBaseResponse<EmployeeScheduleAssignmentDto>>
{
    public async Task<GenericBaseResponse<EmployeeScheduleAssignmentDto>> Handle(
        AssignEmployeeScheduleCommand request,
        CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId, cancellationToken);

        if (employee is null)
        {
            return GenericBaseResponse<EmployeeScheduleAssignmentDto>.Fail(
                "Employee not found.",
                HttpStatusCode.NotFound);
        }

        if (!employee.IsActive)
        {
            return GenericBaseResponse<EmployeeScheduleAssignmentDto>.Fail(
                "Cannot assign a schedule to an inactive employee.",
                HttpStatusCode.BadRequest);
        }

        var schedule = await dbContext.WorkSchedules
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.WorkScheduleId, cancellationToken);

        if (schedule is null)
        {
            return GenericBaseResponse<EmployeeScheduleAssignmentDto>.Fail(
                "Work schedule not found.",
                HttpStatusCode.NotFound);
        }

        if (!schedule.IsActive)
        {
            return GenericBaseResponse<EmployeeScheduleAssignmentDto>.Fail(
                "Cannot assign an inactive work schedule.",
                HttpStatusCode.BadRequest);
        }

        // Overlapping assignment check
        var reqTo = request.EffectiveTo ?? DateOnly.MaxValue;
        var reqFrom = request.EffectiveFrom;

        var existingActiveAssignments = await dbContext.EmployeeScheduleAssignments
            .Where(a => a.EmployeeId == request.EmployeeId && a.IsActive)
            .ToListAsync(cancellationToken);

        var hasOverlap = existingActiveAssignments.Any(a =>
        {
            var existingTo = a.EffectiveTo ?? DateOnly.MaxValue;
            return a.EffectiveFrom <= reqTo && existingTo >= reqFrom;
        });

        if (hasOverlap)
        {
            return GenericBaseResponse<EmployeeScheduleAssignmentDto>.Fail(
                "The employee already has an active schedule assignment overlapping with this effective date range.",
                HttpStatusCode.Conflict);
        }

        var assignment = new EmployeeScheduleAssignment
        {
            EmployeeId = request.EmployeeId,
            WorkScheduleId = request.WorkScheduleId,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            IsActive = true,
            Notes = request.Notes?.Trim(),
            Created_Utc = DateTime.UtcNow,
            Created_By = currentUser.UserId
        };

        dbContext.EmployeeScheduleAssignments.Add(assignment);
        await dbContext.SaveChangesAsync(cancellationToken);

        var dto = new EmployeeScheduleAssignmentDto(
            assignment.Id,
            employee.Id,
            employee.EmployeeCode,
            employee.FullName,
            employee.Department,
            schedule.Id,
            schedule.Name,
            assignment.EffectiveFrom,
            assignment.EffectiveTo,
            assignment.IsActive,
            assignment.Notes,
            assignment.Created_Utc,
            assignment.Created_By
        );

        return GenericBaseResponse<EmployeeScheduleAssignmentDto>.Success(
            dto,
            "Employee schedule assignment created successfully.",
            HttpStatusCode.Created);
    }
}
