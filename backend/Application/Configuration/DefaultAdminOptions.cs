namespace Application.Configuration;

public sealed class DefaultAdminOptions
{
    public const string SectionName = "DefaultAdmin";

    public string Email { get; set; } = "admin@corestarter.local";
    public string Password { get; set; } = "Admin@123456";
    public string FullName { get; set; } = "System Administrator";
    public string JobTitle { get; set; } = "Administrator";
    public string Department { get; set; } = "IT";
    public bool AutoSeed { get; set; } = true;
}
