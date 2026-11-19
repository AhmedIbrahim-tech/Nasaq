namespace Domain.Authorization;

public static class RoleNames
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string Supervisor = "Supervisor";
    public const string Employee = "Employee";

    public static readonly IReadOnlyList<string> All = [SuperAdmin, Admin, Supervisor, Employee];
}

