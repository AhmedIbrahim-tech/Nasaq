namespace Application.Configuration;

public sealed class ProtectedUsersOptions
{
    public const string SectionName = "ProtectedUsers";

    public List<string> Emails { get; set; } = ["admin@nasaq.local"];

    public bool IsProtected(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var normalized = email.Trim();
        return Emails.Any(e => string.Equals(e?.Trim(), normalized, StringComparison.OrdinalIgnoreCase));
    }
}
