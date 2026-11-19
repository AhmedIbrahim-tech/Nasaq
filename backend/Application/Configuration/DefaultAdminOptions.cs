namespace Application.Configuration;

public sealed class DefaultAdminOptions
{
    public const string SectionName = "DefaultAdmin";

    public string Email { get; set; } = "superadmin@nasaq.local";
    public string Password { get; set; } = "Admin@123456";
    public string FullName { get; set; } = "System SuperAdmin";
    public string JobTitle { get; set; } = "SuperAdmin";
    public string Department { get; set; } = "IT";
    public bool AutoSeed { get; set; } = false;
}
