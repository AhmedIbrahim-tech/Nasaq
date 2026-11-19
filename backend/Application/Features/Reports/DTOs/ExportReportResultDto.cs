namespace Application.Features.Reports.DTOs;

public sealed class ExportReportResultDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "text/csv; charset=utf-8";
    public byte[] FileContents { get; set; } = [];
}
