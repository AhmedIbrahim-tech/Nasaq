namespace Application.Features.Reports.DTOs;

public sealed class ReportColumnDto
{
    public string Key { get; set; } = string.Empty;
    public string LabelAr { get; set; } = string.Empty;
    public string LabelEn { get; set; } = string.Empty;
    public string Type { get; set; } = "string"; // string, number, currency, date, badge
    public string Align { get; set; } = "left"; // left, center, right
}
