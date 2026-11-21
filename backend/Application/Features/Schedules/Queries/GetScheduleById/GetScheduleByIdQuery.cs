using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Queries.GetScheduleById;

public sealed record GetScheduleByIdQuery(Guid Id) : IRequest<GenericBaseResponse<WorkScheduleDto>>;
