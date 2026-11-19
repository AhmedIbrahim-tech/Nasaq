namespace Application.Configuration;

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    public bool Enabled { get; set; }

    public string SmtpHost { get; set; } = "";

    public int SmtpPort { get; set; } = 587;

    public bool UseSsl { get; set; } = true;

    public string? UserName { get; set; }

    public string? Password { get; set; }

    public string DefaultFromAddress { get; set; } = "noreply@localhost";

    public string DefaultFromName { get; set; } = "Nasaq";
}
