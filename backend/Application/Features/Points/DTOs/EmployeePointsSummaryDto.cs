namespace Application.Features.Points.DTOs;

public sealed record EmployeePointsSummaryDto(
    Guid EmployeeId,
    string EmployeeName,
    int TotalFinalizedPoints,
    int GreenPoints,
    int RedPoints,
    int BlackPoints,
    int PendingPoints,
    List<PointTransactionDto> RecentTransactions
);
