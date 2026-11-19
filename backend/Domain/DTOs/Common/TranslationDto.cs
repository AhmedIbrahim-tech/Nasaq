using Domain.Common;

namespace Domain.DTOs.Common;

public sealed record TranslationDto : ITranslation
{
    public string LanguageCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public TranslationDto() { }

    public TranslationDto(string languageCode, string name, string? description = null)
    {
        LanguageCode = languageCode;
        Name = name;
        Description = description;
    }
}
