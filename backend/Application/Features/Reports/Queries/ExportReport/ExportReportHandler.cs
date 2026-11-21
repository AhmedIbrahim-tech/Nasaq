using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Reports.DTOs;
using Application.Features.Reports.Exporting;
using Application.Features.Reports.Queries.ExecuteReport;
using Domain.Common;
using MediatR;

namespace Application.Features.Reports.Queries.ExportReport;

public sealed class ExportReportHandler : IRequestHandler<ExportReportQuery, GenericBaseResponse<ExportReportResultDto>>
{
    private readonly IMediator _mediator;

    public ExportReportHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<GenericBaseResponse<ExportReportResultDto>> Handle(
        ExportReportQuery request,
        CancellationToken cancellationToken)
    {
        var execResult = await _mediator.Send(new ExecuteReportQuery(request.Filter), cancellationToken);

        if (!execResult.Succeeded || execResult.Data == null)
        {
            return GenericBaseResponse<ExportReportResultDto>.Fail(
                execResult.Message ?? "Failed to generate report data.",
                errors: execResult.Errors);
        }

        var report = execResult.Data;
        var format = (request.Filter.ExportFormat ?? "csv").ToLowerInvariant();
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmm");

        byte[] fileBytes;
        string contentType;
        string fileName;

        switch (format)
        {
            case "xlsx":
                fileBytes = ReportExportEngine.ExportExcel(report, request.Filter);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = $"{report.ReportId}_{timestamp}.xlsx";
                break;

            case "pdf":
                fileBytes = ReportExportEngine.ExportPdf(report, request.Filter);
                contentType = "application/pdf";
                fileName = $"{report.ReportId}_{timestamp}.pdf";
                break;

            case "csv":
            default:
                fileBytes = ReportExportEngine.ExportCsv(report, request.Filter);
                contentType = "text/csv; charset=utf-8";
                fileName = $"{report.ReportId}_{timestamp}.csv";
                break;
        }

        var result = new ExportReportResultDto
        {
            FileName = fileName,
            ContentType = contentType,
            FileContents = fileBytes
        };

        return GenericBaseResponse<ExportReportResultDto>.Success(result);
    }
}
