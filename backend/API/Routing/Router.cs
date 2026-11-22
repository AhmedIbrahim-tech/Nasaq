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
        public const string ForgotPassword = Prefix + "/forgot-password";
        public const string PendingPasswordRequests = Prefix + "/password-requests";
        public const string ApprovePasswordRequest = Prefix + "/password-requests/{id}/approve";
        public const string RejectPasswordRequest = Prefix + "/password-requests/{id}/reject";
        public const string AdminResetPassword = Prefix + "/users/{userId}/reset-password";
        public const string AdminDirectChangePassword = Prefix + "/users/{userId}/direct-change-password";
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
        public const string Summary = Prefix + "/summary";
        public const string Create = Prefix;
        public const string Supervisors = Prefix + "/supervisors";
        public const string MyProfile = Prefix + "/me";
        public const string MyProfilePhoto = Prefix + "/me/photo";
        public const string GetById = Prefix + "/" + SingleRoute;
        public const string Update = Prefix + "/" + SingleRoute;
        public const string ToggleStatus = Prefix + "/" + SingleRoute + "/status";
        public const string Delete = Prefix + "/" + SingleRoute;
        public const string BulkDelete = Prefix + "/bulk-delete";
    }

    public static class Files
    {
        public const string Prefix = Rule + "files";

        public const string List = Prefix;
        public const string Upload = Prefix + "/upload";
        public const string GetById = Prefix + "/" + SingleRoute;
        public const string Download = Prefix + "/" + SingleRoute + "/download";
    }

    public static class Locations
    {
        public const string Prefix = Rule + "locations";

        public const string List = Prefix;
        public const string Summary = Prefix + "/summary";
        public const string Create = Prefix;
        public const string GetById = Prefix + "/" + SingleRoute;
        public const string Update = Prefix + "/" + SingleRoute;
        public const string ToggleStatus = Prefix + "/" + SingleRoute + "/status";
        public const string Delete = Prefix + "/" + SingleRoute;
        public const string BulkDelete = Prefix + "/bulk-delete";
        public const string GlobalRadius = Prefix + "/global-radius";
        public const string UpdateCoordinates = Prefix + "/" + SingleRoute + "/coordinates";
        public const string MyPersonalLocation = Prefix + "/my-personal";
        public const string RegisterPersonalLocation = Prefix + "/register-personal";
        public const string RequestLocationChange = Prefix + "/request-change";
        public const string CancelLocationRequest = Prefix + "/requests/{id}/cancel";
        public const string PendingLocationRequests = Prefix + "/requests/pending";
        public const string ApproveLocationRequest = Prefix + "/requests/{id}/approve";
        public const string RejectLocationRequest = Prefix + "/requests/{id}/reject";
        public const string AdminChangeEmployeeLocation = Prefix + "/employees/{employeeId}/change-location";
        public const string ResetEmployeeLocation = Prefix + "/employees/{employeeId}/reset-location";
    }

    public static class Shifts
    {
        public const string Prefix = Rule + "shifts";

        public const string List = Prefix;
        public const string Summary = Prefix + "/summary";
        public const string Create = Prefix;
        public const string GetById = Prefix + "/" + SingleRoute;
        public const string Update = Prefix + "/" + SingleRoute;
        public const string ToggleStatus = Prefix + "/" + SingleRoute + "/status";
        public const string Delete = Prefix + "/" + SingleRoute;
    }

    public static class Schedules
    {
        public const string Prefix = Rule + "schedules";

        public const string List = Prefix;
        public const string Summary = Prefix + "/summary";
        public const string Create = Prefix;
        public const string GetById = Prefix + "/" + SingleRoute;
        public const string Update = Prefix + "/" + SingleRoute;
        public const string ToggleStatus = Prefix + "/" + SingleRoute + "/status";
        public const string Delete = Prefix + "/" + SingleRoute;

        public const string Assignments = Prefix + "/assignments";
        public const string AssignmentById = Prefix + "/assignments/" + SingleRoute;
    }

    public static class Attendance
    {
        public const string Prefix = Rule + "attendance";

        public const string CheckIn = Prefix + "/check-in";
        public const string CheckOut = Prefix + "/check-out";
        public const string Status = Prefix + "/status";
        public const string MyHistory = Prefix + "/my-history";
        public const string List = Prefix;
        public const string GetById = Prefix + "/" + SingleRoute;
    }

    public static class Points
    {
        public const string Prefix = Rule + "points";

        public const string MySummary = Prefix + "/me/summary";
        public const string MyTransactions = Prefix + "/me/transactions";
        public const string Transactions = Prefix + "/transactions";
        public const string Rules = Prefix + "/rules";
        public const string RuleById = Prefix + "/rules/" + SingleRoute;
        public const string RuleToggleStatus = Prefix + "/rules/" + SingleRoute + "/status";
        public const string Evaluate = Prefix + "/evaluate";
        public const string Reverse = Prefix + "/transactions/" + SingleRoute + "/reverse";
    }

    public static class Leaves
    {
        public const string Prefix = Rule + "leaves";

        public const string Types = Prefix + "/types";
        public const string TypeById = Prefix + "/types/" + SingleRoute;
        public const string TypeToggleStatus = Prefix + "/types/" + SingleRoute + "/status";

        public const string Requests = Prefix + "/requests";
        public const string MyRequests = Prefix + "/requests/my";
        public const string RequestById = Prefix + "/requests/" + SingleRoute;
        public const string CancelRequest = Prefix + "/requests/" + SingleRoute + "/cancel";

        public const string Approvals = Prefix + "/approvals";
        public const string Approve = Prefix + "/approvals/" + SingleRoute + "/approve";
        public const string Reject = Prefix + "/approvals/" + SingleRoute + "/reject";

        public const string Summary = Prefix + "/summary";
    }

    public static class AdminOperations
    {
        public const string Prefix = Rule + "admin-operations";

        public const string Summary = Prefix + "/summary";
        public const string DailyAttendance = Prefix + "/attendance/daily";
        public const string GpsExceptions = Prefix + "/attendance/gps-exceptions";
        public const string ApproveGps = Prefix + "/attendance/" + SingleRoute + "/approve";
        public const string RejectGps = Prefix + "/attendance/" + SingleRoute + "/reject";
        public const string IncompleteAttendance = Prefix + "/attendance/incomplete";
        public const string CorrectIncomplete = Prefix + "/attendance/" + SingleRoute + "/correct";
        public const string ManualPointAdjustment = Prefix + "/points/adjust";
    }

    public static class Reports
    {
        public const string Prefix = Rule + "reports";

        public const string Catalog = Prefix + "/catalog";
        public const string Execute = Prefix + "/execute";
        public const string Export = Prefix + "/export";
    }

    public static class Hubs
    {
        public const string Notifications = "/" + Rule + "hubs/notifications";
    }
}
