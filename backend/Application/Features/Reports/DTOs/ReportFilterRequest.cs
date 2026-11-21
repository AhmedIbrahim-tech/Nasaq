using System;

namespace Application.Features.Reports.DTOs;

public sealed class ReportFilterRequest
{
    public string ReportId { get; set; } = string.Empty;
    public Guid? CompanyId { get; set; }
    public Guid? BranchId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? EntityId { get; set; } // ClientId, SupplierId, StockId, BankAccountId, TreasuryId, EmployeeId, ContributorId
    public Guid? EmployeeId { get; set; }
    public Guid? WorkLocationId { get; set; }
    public Guid? WorkShiftId { get; set; }
    public string? PointCategory { get; set; }
    public string? Department { get; set; }
    public string? Status { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string ExportFormat { get; set; } = "csv"; // "pdf", "xlsx", "csv"
    public string ExportScope { get; set; } = "all"; // "all" or "current_page"
    public string Language { get; set; } = "en"; // "ar" or "en"
}
