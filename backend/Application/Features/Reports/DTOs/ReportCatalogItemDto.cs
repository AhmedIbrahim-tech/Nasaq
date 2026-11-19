using System.Collections.Generic;

namespace Application.Features.Reports.DTOs;

public sealed class ReportCatalogItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ReportType { get; set; } = "summary"; // ledger, statement, summary, inventory, directory
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string RequiredPermission { get; set; } = string.Empty;
    public IReadOnlyList<string> SupportedFilters { get; set; } = [];
}
