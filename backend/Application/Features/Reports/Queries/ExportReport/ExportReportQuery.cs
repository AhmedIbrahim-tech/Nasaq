using Application.Features.Reports.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Reports.Queries.ExportReport;

public sealed record ExportReportQuery(ReportFilterRequest Filter) : IRequest<GenericBaseResponse<ExportReportResultDto>>;
