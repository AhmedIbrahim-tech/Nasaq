namespace Application.Features.Schedules.Commands.DeleteSchedule;

public sealed record DeleteScheduleCommand(Guid Id) : IRequest<GenericBaseResponse<object?>>;
