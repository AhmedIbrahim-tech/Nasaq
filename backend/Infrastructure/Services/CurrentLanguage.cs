using System;
using Application.Abstractions;
using Domain.Common;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services;

public sealed class CurrentLanguage : ICurrentLanguage
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentLanguage(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string LanguageCode
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return "ar";

            // 1. Explicit query parameter (?lang=ar, ?locale=en)
            if (httpContext.Request.Query.TryGetValue("lang", out var langQuery) && !string.IsNullOrWhiteSpace(langQuery))
            {
                return TranslationResolutionExtensions.NormalizeLanguageCode(langQuery);
            }
            if (httpContext.Request.Query.TryGetValue("locale", out var localeQuery) && !string.IsNullOrWhiteSpace(localeQuery))
            {
                return TranslationResolutionExtensions.NormalizeLanguageCode(localeQuery);
            }

            // 2. Accept-Language header
            var acceptLang = httpContext.Request.Headers["Accept-Language"].ToString();
            if (!string.IsNullOrWhiteSpace(acceptLang))
            {
                // Take first priority language
                var primary = acceptLang.Split(',', ';')[0];
                return TranslationResolutionExtensions.NormalizeLanguageCode(primary);
            }

            // 3. System default for CoreStarter
            return "ar";
        }
    }
}
