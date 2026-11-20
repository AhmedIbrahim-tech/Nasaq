namespace API.Routing;

public static class Router
{
    private const string Root = "api";
    private const string Version = "v1";
    private const string Rule = Root + "/" + Version + "/";
    private const string SingleRoute = "{id}";

    public static class Auth
    {
        public const string Prefix = Rule + "auth";

        public const string Login = Prefix + "/login";
        public const string Refresh = Prefix + "/refresh";
        public const string Logout = Prefix + "/logout";
        public const string Me = Prefix + "/me";
        public const string Profile = Prefix + "/me/profile";
        public const string ChangePassword = Prefix + "/me/change-password";
        public const string FirstLoginChangePassword = Prefix + "/first-login-change-password";
    }

    public static class Notifications
    {
        public const string Prefix = Rule + "notifications";

        public const string GetById = Prefix + "/" + SingleRoute;
        public const string MarkRead = Prefix + "/" + SingleRoute + "/read";
        public const string ReadAll = Prefix + "/read-all";
        public const string UnreadCount = Prefix + "/unread-count";
        public const string Recent = Prefix + "/recent";
    }

    public static class Employees
    {
        public const string Prefix = Rule + "employees";

        public const string List = Prefix;
        public const string Create = Prefix;
        public const string Supervisors = Prefix + "/supervisors";
        public const string MyProfile = Prefix + "/me";
        public const string GetById = Prefix + "/" + SingleRoute;
        public const string Update = Prefix + "/" + SingleRoute;
        public const string ToggleStatus = Prefix + "/" + SingleRoute + "/status";
    }

    public static class Files
    {
        public const string Prefix = Rule + "files";

        public const string List = Prefix;
        public const string Upload = Prefix + "/upload";
        public const string GetById = Prefix + "/" + SingleRoute;
        public const string Download = Prefix + "/" + SingleRoute + "/download";
    }

    public static class Hubs
    {
        public const string Notifications = "/" + Rule + "hubs/notifications";
    }
}
