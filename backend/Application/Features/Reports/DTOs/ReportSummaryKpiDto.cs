namespace Application.Features.Reports.DTOs;

public sealed class ReportSummaryKpiDto
{
    public string Key { get; set; } = string.Empty;
    public string LabelAr { get; set; } = string.Empty;
    public string LabelEn { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Type { get; set; } = "number"; // number, currency
}
