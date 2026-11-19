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
}

