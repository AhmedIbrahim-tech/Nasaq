using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Domain.Identity;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? FullNameAr { get; set; }
    public string? FullNameEn => FullName;
    public string? JobTitle { get; set; }
    public string? JobTitleAr { get; set; }
    public string? Department { get; set; }
    public string? DepartmentAr { get; set; }

    public bool IsActive { get; set; } = true;
    public bool MustChangePasswordOnNextLogin { get; set; } = false;
    public DateTime? TemporaryPasswordExpiresAtUtc { get; set; }

    public string? GetFullName(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(FullNameAr)
            ? FullNameAr
            : FullName;
}
