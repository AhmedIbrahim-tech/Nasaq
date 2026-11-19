using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Domain.Identity;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? ProfileImagePath { get; set; }

    public bool IsActive { get; set; } = true;
    public bool MustChangePasswordOnNextLogin { get; set; } = false;
    public DateTime? TemporaryPasswordExpiresAtUtc { get; set; }
}
