namespace Application.Features.Employees.DTOs;

public sealed record EmployeesSummaryDto
{
    public int TotalEmployees { get; init; }
    public int ActiveEmployees { get; init; }
    public int InactiveEmployees { get; init; }
    public int AssignedLocationCount { get; init; }
    public int UnassignedLocationCount { get; init; }
    public int SupervisorCount { get; init; }
}
