using System.Collections.Generic;
using System.Threading.Tasks;
using API.Controllers.Base;
using API.Routing;
using Application.Features.Reports.DTOs;
using Application.Features.Reports.Queries.ExecuteReport;
using Application.Features.Reports.Queries.ExportReport;
using Application.Features.Reports.Queries.GetReportCatalog;
using Domain.Authorization;
using Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ReportsController : ApiControllerBase
{
    [HttpGet(Router.Reports.Catalog)]
    [Authorize(Policy = PolicyNames.ReportsView)]
    public async Task<IActionResult> GetCatalog()
    {
        var response = await _mediator.Send(new GetReportCatalogQuery());
        return ActionResult(response);
    }

    [HttpPost(Router.Reports.Execute)]
    [Authorize(Policy = PolicyNames.ReportsView)]
    public async Task<IActionResult> ExecuteReport([FromBody] ReportFilterRequest filter)
    {
        var response = await _mediator.Send(new ExecuteReportQuery(filter));
        return ActionResult(response);
    }

    [HttpPost(Router.Reports.Export)]
    [Authorize(Policy = PolicyNames.ReportsExport)]
    public async Task<IActionResult> ExportReport([FromBody] ReportFilterRequest filter)
    {
        var response = await _mediator.Send(new ExportReportQuery(filter));

        if (!response.Succeeded || response.Data == null)
        {
            return BadRequest(response);
        }

        return File(
            response.Data.FileContents,
            response.Data.ContentType,
            response.Data.FileName
        );
    }
}
