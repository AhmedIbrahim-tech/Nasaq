using Application.Features.Reports.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Reports.Queries.ExecuteReport;

public sealed record ExecuteReportQuery(ReportFilterRequest Filter) : IRequest<GenericBaseResponse<ReportResultDto>>;
