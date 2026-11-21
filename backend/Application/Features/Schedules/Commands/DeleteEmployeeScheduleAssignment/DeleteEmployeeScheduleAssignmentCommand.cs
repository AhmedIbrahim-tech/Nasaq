namespace Application.Features.Schedules.Commands.DeleteEmployeeScheduleAssignment;

public sealed record DeleteEmployeeScheduleAssignmentCommand(Guid Id) : IRequest<GenericBaseResponse<object?>>;
