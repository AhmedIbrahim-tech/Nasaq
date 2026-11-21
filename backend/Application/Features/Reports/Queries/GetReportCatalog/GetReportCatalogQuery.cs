using System.Collections.Generic;
using Application.Features.Reports.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Reports.Queries.GetReportCatalog;

public sealed record GetReportCatalogQuery : IRequest<GenericBaseResponse<IReadOnlyList<ReportCatalogItemDto>>>;
