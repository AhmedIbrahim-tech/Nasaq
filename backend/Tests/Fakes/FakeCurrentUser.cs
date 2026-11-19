namespace Tests.Fakes;

public class FakeCurrentUser : ICurrentUser
{
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public bool IsAuthenticated => !string.IsNullOrEmpty(UserId);
    public List<string> RolesList { get; set; } = new();
    public IReadOnlyList<string> Roles => RolesList;

    public bool IsInRole(string role) =>
        RolesList.Any(r => string.Equals(r, role, StringComparison.OrdinalIgnoreCase));

    public bool IsSuperAdmin => IsInRole(RoleNames.SuperAdmin);
    public bool IsAdmin => IsInRole(RoleNames.Admin);
    public bool IsSupervisor => IsInRole(RoleNames.Supervisor);
    public bool IsEmployee => IsInRole(RoleNames.Employee);
}
