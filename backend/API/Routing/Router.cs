namespace API.Routing;

public static class Router
{
    #region Const Params

    private const string Root = "api";
    private const string Version = "v1";
    private const string Rule = Root + "/" + Version + "/";
    private const string SingleRoute = "{id}";

    #endregion

    public static class Auth
    {
        public const string Prefix = Rule + "auth";

        public const string Login = Prefix + "/login";
        public const string Refresh = Prefix + "/refresh";
        public const string Logout = Prefix + "/logout";
        public const string Me = Prefix + "/me";
        public const string Profile = Prefix + "/me/profile";
        public const string Avatar = Prefix + "/me/avatar";
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

    public static class Hubs
    {
        public const string Notifications = "/" + Rule + "hubs/notifications";
    }
}
