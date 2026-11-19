namespace Domain.Common;

public sealed class ValidationError
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ValidationError()
    {
    }

    public ValidationError(string name, string description)
    {
        Name = name;
        Description = description;
    }
}
