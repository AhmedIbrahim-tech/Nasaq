using Application.Common;
using Application.Features.Attendance.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.AdminOperations.Queries.GetDailyAttendanceOperations;

public sealed record GetDailyAttendanceOperationsQuery(
    DateOnly? Date = null,
    string? Search = null,
    Guid? WorkLocationId = null,
    Guid? WorkShiftId = null,
    AttendanceStatus? Status = null,
    bool? MissingCheckOutOnly = null,
    bool? PendingReviewOnly = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<GenericBaseResponse<PaginationResult<AttendanceRecordDto>>>;
