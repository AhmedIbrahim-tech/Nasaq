using System;
using System.Collections.Generic;

namespace Application.Features.Reports.DTOs;

public sealed class ReportResultDto
{
    public string ReportId { get; set; } = string.Empty;
    public string ReportNameAr { get; set; } = string.Empty;
    public string ReportNameEn { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public int TotalRecords { get; set; }
    public IReadOnlyList<ReportColumnDto> Columns { get; set; } = [];
    public IReadOnlyList<IDictionary<string, object?>> Rows { get; set; } = [];
    public IReadOnlyList<ReportSummaryKpiDto> SummaryKpis { get; set; } = [];
}
