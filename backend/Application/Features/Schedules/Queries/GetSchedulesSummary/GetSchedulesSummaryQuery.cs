using Application.Features.Schedules.DTOs;

namespace Application.Features.Schedules.Queries.GetSchedulesSummary;

public sealed record GetSchedulesSummaryQuery : IRequest<GenericBaseResponse<SchedulesSummaryDto>>;
