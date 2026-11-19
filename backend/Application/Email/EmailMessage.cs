namespace Application.Email;

public sealed class EmailMessage
{
    public required string To { get; init; }

    public string? Cc { get; init; }

    public string? Bcc { get; init; }

    public required string Subject { get; init; }

    public required string Body { get; init; }

    public bool IsHtml { get; init; } = true;

    public string? FromAddress { get; init; }

    public string? FromName { get; init; }
}
