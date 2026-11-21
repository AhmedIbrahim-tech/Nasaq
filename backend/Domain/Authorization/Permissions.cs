namespace Domain.Authorization;

public static class Permissions
{
    public static class Users
    {
        public const string View = "Permissions.Users.View";
        public const string Manage = "Permissions.Users.Manage";
    }

    public static class Roles
    {
        public const string View = "Permissions.Roles.View";
        public const string Manage = "Permissions.Roles.Manage";
    }

    public static class Employees
    {
        public const string View = "Permissions.Employees.View";
        public const string ViewSelf = "Permissions.Employees.ViewSelf";
        public const string Create = "Permissions.Employees.Create";
        public const string Edit = "Permissions.Employees.Edit";
        public const string ToggleStatus = "Permissions.Employees.ToggleStatus";
    }

    public static class Locations
    {
        public const string View = "Permissions.Locations.View";
        public const string Create = "Permissions.Locations.Create";
        public const string Edit = "Permissions.Locations.Edit";
        public const string ToggleStatus = "Permissions.Locations.ToggleStatus";
    }

    public static class Shifts
    {
        public const string View = "Permissions.Shifts.View";
        public const string Create = "Permissions.Shifts.Create";
        public const string Edit = "Permissions.Shifts.Edit";
        public const string ToggleStatus = "Permissions.Shifts.ToggleStatus";
        public const string Delete = "Permissions.Shifts.Delete";
    }

    public static class Schedules
    {
        public const string View = "Permissions.Schedules.View";
        public const string Create = "Permissions.Schedules.Create";
        public const string Edit = "Permissions.Schedules.Edit";
        public const string ToggleStatus = "Permissions.Schedules.ToggleStatus";
        public const string Delete = "Permissions.Schedules.Delete";
        public const string Assign = "Permissions.Schedules.Assign";
    }

    public static class Attendance
    {
        public const string View = "Permissions.Attendance.View";
        public const string ViewSelf = "Permissions.Attendance.ViewSelf";
        public const string CheckIn = "Permissions.Attendance.CheckIn";
        public const string CheckOut = "Permissions.Attendance.CheckOut";
        public const string Manage = "Permissions.Attendance.Manage";
    }

    public static class Points
    {
        public const string View = "Permissions.Points.View";
        public const string ViewSelf = "Permissions.Points.ViewSelf";
        public const string Manage = "Permissions.Points.Manage";
        public const string Adjust = "Permissions.Points.Adjust";
    }

    public static class Leaves
    {
        public const string View = "Permissions.Leaves.View";
        public const string ViewSelf = "Permissions.Leaves.ViewSelf";
        public const string Submit = "Permissions.Leaves.Submit";
        public const string Cancel = "Permissions.Leaves.Cancel";
        public const string Approve = "Permissions.Leaves.Approve";
        public const string ManageTypes = "Permissions.Leaves.ManageTypes";
    }

    public static class Reports
    {
        public const string View = "Permissions.Reports.View";
        public const string Export = "Permissions.Reports.Export";
    }
}
