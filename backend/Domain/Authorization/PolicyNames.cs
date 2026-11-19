namespace Domain.Authorization;

public static class PolicyNames
{
    public const string RequireSuperAdmin = "RequireSuperAdmin";
    public const string RequireAdmin = "RequireAdmin";
    public const string RequireSupervisor = "RequireSupervisor";
    public const string RequireEmployee = "RequireEmployee";

    public const string EmployeeManagement = "EmployeeManagement";
    public const string EmployeeView = "EmployeeView";
}

