namespace Application.Email;

public sealed record EmailSendResult(bool Success, string? ErrorMessage)
{
    public static EmailSendResult Ok() => new(true, null);

    public static EmailSendResult Fail(string message) => new(false, message);
}
