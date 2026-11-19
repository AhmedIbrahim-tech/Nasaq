using System;
using System.Collections.Generic;
using System.Linq;

namespace Domain.Common;

public static class TranslationResolutionExtensions
{
    public static string ResolveName(
        this IEnumerable<ITranslation>? translations,
        string? requestedLanguage,
        string legacyFallbackName,
        string defaultLanguage = "ar")
    {
        if (translations != null)
        {
            var list = translations as IList<ITranslation> ?? translations.ToList();

            if (!string.IsNullOrWhiteSpace(requestedLanguage))
            {
                var normReq = NormalizeLanguageCode(requestedLanguage);
                var exact = list.FirstOrDefault(t => NormalizeLanguageCode(t.LanguageCode) == normReq);
                if (exact != null && !string.IsNullOrWhiteSpace(exact.Name))
                    return exact.Name;

                if (normReq == "en" && !string.IsNullOrWhiteSpace(legacyFallbackName))
                    return legacyFallbackName;
            }

            var normDefault = NormalizeLanguageCode(defaultLanguage);
            var defMatch = list.FirstOrDefault(t => NormalizeLanguageCode(t.LanguageCode) == normDefault);
            if (defMatch != null && !string.IsNullOrWhiteSpace(defMatch.Name))
                return defMatch.Name;

            var anyMatch = list.FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.Name));
            if (anyMatch != null)
                return anyMatch.Name;
        }

        return legacyFallbackName;
    }

    public static string? ResolveDescription(
        this IEnumerable<ITranslation>? translations,
        string? requestedLanguage,
        string? legacyFallbackDescription,
        string defaultLanguage = "ar")
    {
        if (translations != null)
        {
            var list = translations as IList<ITranslation> ?? translations.ToList();

            if (!string.IsNullOrWhiteSpace(requestedLanguage))
            {
                var normReq = NormalizeLanguageCode(requestedLanguage);
                var exact = list.FirstOrDefault(t => NormalizeLanguageCode(t.LanguageCode) == normReq);
                if (exact != null && !string.IsNullOrWhiteSpace(exact.Description))
                    return exact.Description;

                if (normReq == "en" && !string.IsNullOrWhiteSpace(legacyFallbackDescription))
                    return legacyFallbackDescription;
            }

            var normDefault = NormalizeLanguageCode(defaultLanguage);
            var defMatch = list.FirstOrDefault(t => NormalizeLanguageCode(t.LanguageCode) == normDefault);
            if (defMatch != null && !string.IsNullOrWhiteSpace(defMatch.Description))
                return defMatch.Description;

            var anyMatch = list.FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.Description));
            if (anyMatch != null)
                return anyMatch.Description;
        }

        return legacyFallbackDescription;
    }

    public static string NormalizeLanguageCode(string? languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            return "ar";

        var trimmed = languageCode.Trim().ToLowerInvariant();
        var dashIdx = trimmed.IndexOf('-');
        if (dashIdx > 0)
        {
            return trimmed.Substring(0, dashIdx);
        }

        return trimmed;
    }
}
