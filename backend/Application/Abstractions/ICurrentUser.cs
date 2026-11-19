namespace Application.Abstractions;

public interface ICurrentUser
{
    string? UserId { get; }
    string? UserName { get; }
    bool IsAuthenticated { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsInRole(string role);
    bool IsSuperAdmin { get; }
    bool IsAdmin { get; }
    bool IsSupervisor { get; }
    bool IsEmployee { get; }
}
