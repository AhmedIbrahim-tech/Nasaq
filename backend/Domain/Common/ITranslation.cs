namespace Domain.Common;

public interface ITranslation
{
    string LanguageCode { get; set; }
    string Name { get; set; }
    string? Description { get; set; }
}
