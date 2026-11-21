using Domain.Entities;
using Domain.Enums;

namespace Application.Features.Points.DTOs;

public sealed record PointTransactionDto(
    Guid Id,
    Guid EmployeeId,
    string? EmployeeName,
    string? EmployeeCode,
    Guid? RuleId,
    string? RuleName,
    PointCategory Category,
    PointEventType EventType,
    int Points,
    PointTransactionStatus Status,
    string? SourceEventType,
    Guid? SourceEventId,
    DateOnly Date,
    DateTime TimestampUtc,
    string Reason,
    Guid? RelatedTransactionId,
    DateTime Created_Utc,
    string? Created_By,
    string? EmployeeNameAr = null,
    string? RuleNameAr = null
)
{
    public static PointTransactionDto FromEntity(PointTransaction t) => new(
        t.Id,
        t.EmployeeId,
        t.Employee?.FullName,
        t.Employee?.EmployeeCode,
        t.RuleId,
        t.Rule?.Name,
        t.Category,
        t.EventType,
        t.Points,
        t.Status,
        t.SourceEventType,
        t.SourceEventId,
        t.Date,
        t.TimestampUtc,
        t.Reason,
        t.RelatedTransactionId,
        t.Created_Utc,
        t.Created_By,
        t.Employee?.FullNameAr,
        t.Rule?.NameAr
    );
}
