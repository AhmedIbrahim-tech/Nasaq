namespace Domain.Authorization;

public static class PolicyNames
{
    public const string RequireSuperAdmin = "RequireSuperAdmin";
    public const string RequireAdmin = "RequireAdmin";
    public const string RequireSupervisor = "RequireSupervisor";
    public const string RequireEmployee = "RequireEmployee";

    public const string EmployeeManagement = "EmployeeManagement";
    public const string EmployeeView = "EmployeeView";

    public const string LocationManagement = "LocationManagement";
    public const string LocationView = "LocationView";

    public const string ScheduleManagement = "ScheduleManagement";
    public const string ScheduleView = "ScheduleView";

    public const string AttendanceManagement = "AttendanceManagement";
    public const string AttendanceView = "AttendanceView";

    public const string PointsManagement = "PointsManagement";
    public const string PointsView = "PointsView";

    public const string LeaveManagement = "LeaveManagement";
    public const string LeaveView = "LeaveView";

    public const string ReportsView = "ReportsView";
    public const string ReportsExport = "ReportsExport";
}
