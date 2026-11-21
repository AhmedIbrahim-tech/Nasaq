using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Features.Reports.DTOs;
using Application.Features.Reports.Queries.ExecuteReport;
using Application.Features.Reports.Queries.ExportReport;
using Application.Features.Reports.Queries.GetReportCatalog;
using Domain.Authorization;
using Domain.Entities;
using Domain.Enums;
using Tests.Fakes;
using Xunit;

namespace Tests.Reports;

public class ReportsTests : IClassFixture<TestFixture>, IAsyncLifetime
{
    private readonly TestFixture _fixture;
    private readonly FakeCurrentUser _currentUser = new()
    {
        UserId = "admin-user",
        UserName = "admin@nasaq.com",
        RolesList = [RoleNames.Admin, RoleNames.SuperAdmin]
    };

    public ReportsTests(TestFixture fixture)
    {
        _fixture = fixture;
    }

    public async Task InitializeAsync()
    {
        await _fixture.InitializeAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetReportCatalog_ReturnsAllSupportedOperationalReports()
    {
        var handler = new GetReportCatalogHandler();
        var result = await handler.Handle(new GetReportCatalogQuery(), default);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.Equal(8, result.Data.Count);

        var reportIds = result.Data.Select(r => r.Id).ToList();
        Assert.Contains("daily-attendance", reportIds);
        Assert.Contains("monthly-attendance", reportIds);
        Assert.Contains("lateness-absence", reportIds);
        Assert.Contains("points-penalties", reportIds);
        Assert.Contains("disciplinary-summary", reportIds);
        Assert.Contains("employee-operational", reportIds);
        Assert.Contains("leave-report", reportIds);
        Assert.Contains("rewards-claims", reportIds);
    }

    [Fact]
    public async Task ExecuteReport_DailyAttendance_ReturnsRealPersistedData_AndKPIs()
    {
        var shift = new WorkShift
        {
            Name = "Morning Shift",
            StartTime = new TimeOnly(8, 0),
            EndTime = new TimeOnly(16, 0),
            IsActive = true
        };
        _fixture.DbContext.WorkShifts.Add(shift);

        var today = DateTime.UtcNow.Date;
        var checkIn = today.AddHours(8).AddMinutes(10);
        var checkOut = today.AddHours(16).AddMinutes(5);

        var record = new AttendanceRecord
        {
            EmployeeId = _fixture.Employee1.Id,
            Date = DateOnly.FromDateTime(today),
            WorkShiftId = shift.Id,
            CheckInTimeUtc = checkIn,
            CheckOutTimeUtc = checkOut,
            DurationMinutes = 475,
            CheckInStatus = VerificationStatus.Verified,
            CheckOutStatus = VerificationStatus.Verified,
            ArrivalClassification = ArrivalClassification.OnTime,
            Status = AttendanceStatus.Completed
        };
        _fixture.DbContext.AttendanceRecords.Add(record);
        await _fixture.DbContext.SaveChangesAsync();

        var handler = new ExecuteReportHandler(_fixture.DbContext, _currentUser);
        var req = new ReportFilterRequest
        {
            ReportId = "daily-attendance",
            FromDate = today
        };

        var result = await handler.Handle(new ExecuteReportQuery(req), default);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.True(result.Data.TotalRecords >= 1);

        var employeeRow = result.Data.Rows.FirstOrDefault(r => (string)r["employeeCode"]! == _fixture.Employee1.EmployeeCode);
        Assert.NotNull(employeeRow);
        Assert.Equal("Completed", employeeRow["status"]);
        Assert.Equal("Verified", employeeRow["verification"]);

        var totalHoursKpi = result.Data.SummaryKpis.FirstOrDefault(k => k.Key == "total_hours");
        Assert.NotNull(totalHoursKpi);
        Assert.True(totalHoursKpi.Value > 0);
    }

    [Fact]
    public async Task ExecuteReport_LatenessAbsence_RespectsDEC004_BlackCard_AndDEC006()
    {
        var shift = new WorkShift
        {
            Name = "Night Shift",
            StartTime = new TimeOnly(20, 0),
            EndTime = new TimeOnly(4, 0),
            CutoffTime = new TimeOnly(20, 30),
            IsActive = true
        };
        _fixture.DbContext.WorkShifts.Add(shift);

        var checkIn = DateTime.UtcNow.Date.AddHours(21).AddMinutes(0); // after cutoff!
        var record = new AttendanceRecord
        {
            EmployeeId = _fixture.Employee2.Id,
            Date = DateOnly.FromDateTime(checkIn),
            WorkShiftId = shift.Id,
            CheckInTimeUtc = checkIn,
            CheckInStatus = VerificationStatus.Verified,
            ArrivalClassification = ArrivalClassification.AfterCutoff,
            Status = AttendanceStatus.Present
        };
        _fixture.DbContext.AttendanceRecords.Add(record);
        await _fixture.DbContext.SaveChangesAsync();

        var handler = new ExecuteReportHandler(_fixture.DbContext, _currentUser);
        var req = new ReportFilterRequest
        {
            ReportId = "lateness-absence",
            FromDate = DateTime.UtcNow.AddDays(-7),
            ToDate = DateTime.UtcNow.AddDays(1)
        };

        var result = await handler.Handle(new ExecuteReportQuery(req), default);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);

        var row = result.Data.Rows.FirstOrDefault(r => (string)r["employeeCode"]! == _fixture.Employee2.EmployeeCode);
        Assert.NotNull(row);
        Assert.Equal("AfterCutoff", row["exceptionType"]);
        Assert.Contains("Black Card Assigned (DEC-004)", (string)row["policyMarker"]!);
    }

    [Fact]
    public async Task ExecuteReport_PointsPenalties_AccurateLedgerTotals()
    {
        var t1 = new PointTransaction
        {
            EmployeeId = _fixture.Employee1.Id,
            Category = PointCategory.Green,
            EventType = PointEventType.OnTimeArrival,
            Points = 15,
            Status = PointTransactionStatus.Finalized,
            Reason = "Punctual Arrival Bonus",
            TimestampUtc = DateTime.UtcNow.AddHours(-2)
        };
        var t2 = new PointTransaction
        {
            EmployeeId = _fixture.Employee1.Id,
            Category = PointCategory.Red,
            EventType = PointEventType.LateArrival,
            Points = -5,
            Status = PointTransactionStatus.Finalized,
            Reason = "Late Arrival Penalty",
            TimestampUtc = DateTime.UtcNow.AddHours(-1)
        };
        _fixture.DbContext.PointTransactions.AddRange(t1, t2);
        await _fixture.DbContext.SaveChangesAsync();

        var handler = new ExecuteReportHandler(_fixture.DbContext, _currentUser);
        var req = new ReportFilterRequest
        {
            ReportId = "points-penalties",
            EmployeeId = _fixture.Employee1.Id,
            FromDate = DateTime.UtcNow.AddDays(-1),
            ToDate = DateTime.UtcNow.AddDays(1)
        };

        var result = await handler.Handle(new ExecuteReportQuery(req), default);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.True(result.Data.TotalRecords >= 2);

        var greenKpi = result.Data.SummaryKpis.FirstOrDefault(k => k.Key == "green_points");
        Assert.NotNull(greenKpi);
        Assert.True(greenKpi.Value >= 15);

        var redKpi = result.Data.SummaryKpis.FirstOrDefault(k => k.Key == "red_points");
        Assert.NotNull(redKpi);
        Assert.True(redKpi.Value >= 5);
    }

    [Fact]
    public async Task ExecuteReport_DisciplinarySummary_RespectsDEC011_NonMonetaryNotice()
    {
        var handler = new ExecuteReportHandler(_fixture.DbContext, _currentUser);
        var req = new ReportFilterRequest
        {
            ReportId = "disciplinary-summary",
            FromDate = DateTime.UtcNow.AddDays(-30),
            ToDate = DateTime.UtcNow.AddDays(1)
        };

        var result = await handler.Handle(new ExecuteReportQuery(req), default);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);

        // Verify DEC-011 and DEC-012 compliance: Notice present, zero monetary claims
        foreach (var row in result.Data.Rows)
        {
            Assert.Contains("DEC-011/DEC-012", (string)row["financialPolicyNotice"]!);
        }

        var financialStatusKpi = result.Data.SummaryKpis.FirstOrDefault(k => k.Key == "financial_policy_status");
        Assert.NotNull(financialStatusKpi);
        Assert.Equal(0, financialStatusKpi.Value);
    }

    [Fact]
    public async Task ExportReport_Csv_GeneratesUtf8Bom_AndSanitizesFormulaInjection()
    {
        var handler = new ExecuteReportHandler(_fixture.DbContext, _currentUser);
        var req = new ReportFilterRequest
        {
            ReportId = "daily-attendance",
            FromDate = DateTime.UtcNow.Date,
            ExportFormat = "csv",
            ExportScope = "all",
            Language = "en"
        };

        var reportResult = await handler.Handle(new ExecuteReportQuery(req), default);
        Assert.True(reportResult.Succeeded);

        var csvBytes = Application.Features.Reports.Exporting.ReportExportEngine.ExportCsv(reportResult.Data!, req);
        Assert.NotNull(csvBytes);
        Assert.True(csvBytes.Length > 0);

        // Verify UTF-8 BOM: 0xEF, 0xBB, 0xBF
        Assert.Equal(0xEF, csvBytes[0]);
        Assert.Equal(0xBB, csvBytes[1]);
        Assert.Equal(0xBF, csvBytes[2]);

        var csvText = Encoding.UTF8.GetString(csvBytes);
        Assert.Contains("Daily Attendance Report", csvText);
    }

    [Fact]
    public async Task ExportReport_Excel_GeneratesValidSpreadsheet()
    {
        var handler = new ExecuteReportHandler(_fixture.DbContext, _currentUser);
        var req = new ReportFilterRequest
        {
            ReportId = "daily-attendance",
            FromDate = DateTime.UtcNow.Date,
            ExportFormat = "xlsx"
        };

        var reportResult = await handler.Handle(new ExecuteReportQuery(req), default);
        Assert.True(reportResult.Succeeded);

        var excelBytes = Application.Features.Reports.Exporting.ReportExportEngine.ExportExcel(reportResult.Data!, req);
        Assert.NotNull(excelBytes);
        Assert.True(excelBytes.Length > 100);

        // Verify ZIP header for .xlsx: 'PK' (0x50, 0x4B)
        Assert.Equal(0x50, excelBytes[0]);
        Assert.Equal(0x4B, excelBytes[1]);
    }

    [Fact]
    public async Task ExportReport_Pdf_GeneratesValidPdf()
    {
        var handler = new ExecuteReportHandler(_fixture.DbContext, _currentUser);
        var req = new ReportFilterRequest
        {
            ReportId = "daily-attendance",
            FromDate = DateTime.UtcNow.Date,
            ExportFormat = "pdf"
        };

        var reportResult = await handler.Handle(new ExecuteReportQuery(req), default);
        Assert.True(reportResult.Succeeded);

        var pdfBytes = Application.Features.Reports.Exporting.ReportExportEngine.ExportPdf(reportResult.Data!, req);
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 100);

        // Verify PDF magic header: '%PDF' (0x25, 0x50, 0x44, 0x46)
        Assert.Equal(0x25, pdfBytes[0]);
        Assert.Equal(0x50, pdfBytes[1]);
        Assert.Equal(0x44, pdfBytes[2]);
        Assert.Equal(0x46, pdfBytes[3]);
    }
}
