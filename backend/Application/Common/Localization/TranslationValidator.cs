using System.Collections.Generic;
using System.Linq;
using Domain.Common;
using Domain.DTOs.Common;
using FluentValidation;

namespace Application.Common.Localization;

public static class TranslationValidationRules
{
    public static IRuleBuilderOptionsConditions<T, IEnumerable<TranslationDto>?> ValidTranslations<T>(
        this IRuleBuilder<T, IEnumerable<TranslationDto>?> ruleBuilder,
        int maxNameLength = 256,
        int maxDescriptionLength = 1000)
    {
        return ruleBuilder.Custom((translations, context) =>
        {
            if (translations == null)
                return;

            var list = translations.ToList();
            if (list.Count == 0)
                return;

            // 1. Check for duplicate language codes
            var duplicateLangs = list
                .GroupBy(t => TranslationResolutionExtensions.NormalizeLanguageCode(t.LanguageCode))
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateLangs.Count > 0)
            {
                context.AddFailure(
                    context.PropertyPath,
                    $"Duplicate translations found for language code(s): {string.Join(", ", duplicateLangs)}.");
            }

            // 2. Validate individual translation entries
            for (int i = 0; i < list.Count; i++)
            {
                var item = list[i];
                var prefix = $"{context.PropertyPath}[{i}]";

                if (string.IsNullOrWhiteSpace(item.LanguageCode))
                {
                    context.AddFailure($"{prefix}.LanguageCode", "Language code is required for each translation.");
                }
                else if (item.LanguageCode.Trim().Length > 10)
                {
                    context.AddFailure($"{prefix}.LanguageCode", "Language code cannot exceed 10 characters.");
                }

                if (string.IsNullOrWhiteSpace(item.Name))
                {
                    context.AddFailure($"{prefix}.Name", "Translation name is required.");
                }
                else if (item.Name.Trim().Length > maxNameLength)
                {
                    context.AddFailure($"{prefix}.Name", $"Translation name cannot exceed {maxNameLength} characters.");
                }

                if (!string.IsNullOrWhiteSpace(item.Description) && item.Description.Length > maxDescriptionLength)
                {
                    context.AddFailure($"{prefix}.Description", $"Translation description cannot exceed {maxDescriptionLength} characters.");
                }
            }
        });
    }
}
