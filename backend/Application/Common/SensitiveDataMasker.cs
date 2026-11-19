namespace Application.Common;

public static class SensitiveDataMasker
{
    public static string? MaskAccountNumber(string? accountNumber)
    {
        if (string.IsNullOrWhiteSpace(accountNumber))
            return accountNumber;

        var clean = accountNumber.Trim();
        if (clean.Length <= 4)
            return new string('*', clean.Length);

        return new string('*', clean.Length - 4) + clean[^4..];
    }

    public static string? MaskIban(string? iban)
    {
        if (string.IsNullOrWhiteSpace(iban))
            return iban;

        var clean = iban.Trim();
        if (clean.Length <= 6)
            return new string('*', clean.Length);

        return clean[..2] + new string('*', clean.Length - 6) + clean[^4..];
    }

    public static string? MaskSwiftCode(string? swift)
    {
        if (string.IsNullOrWhiteSpace(swift))
            return swift;

        var clean = swift.Trim();
        if (clean.Length <= 4)
            return new string('*', clean.Length);

        return clean[..4] + new string('*', clean.Length - 4);
    }
}
