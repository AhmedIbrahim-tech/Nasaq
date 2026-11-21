using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Reports.DTOs;
using Domain.Authorization;
using Domain.Common;
using MediatR;

namespace Application.Features.Reports.Queries.GetReportCatalog;

public sealed class GetReportCatalogHandler : IRequestHandler<GetReportCatalogQuery, GenericBaseResponse<IReadOnlyList<ReportCatalogItemDto>>>
{
    private static readonly IReadOnlyList<ReportCatalogItemDto> Catalog =
    [
        new()
        {
            Id = "daily-attendance",
            Category = "Attendance",
            ReportType = "summary",
            NameEn = "Daily Attendance Report",
            NameAr = "تقرير الحضور والانصراف اليومي",
            DescriptionEn = "Detailed daily attendance log with GPS verification outcome, arrival classifications, and shift timings.",
            DescriptionAr = "سجل الحضور اليومي المفصل مع نتائج التحقق الجغرافي وتصنيف الحضور ومواعيد الورديات.",
            RequiredPermission = Permissions.Reports.View,
            SupportedFilters = ["Date", "WorkLocation", "WorkShift", "Employee", "Department", "Status", "Search"]
        },
        new()
        {
            Id = "monthly-attendance",
            Category = "Attendance",
            ReportType = "summary",
            NameEn = "Monthly Attendance & Timesheet",
            NameAr = "تقرير الحضور الشهري وساعات العمل",
            DescriptionEn = "Monthly timesheet aggregation per employee including attended days, total hours, on-time arrivals, and leaves.",
            DescriptionAr = "تجميع ساعات العمل والحضور الشهري لكل موظف شاملاً الأيام الفعلية وساعات العمل والإجازات.",
            RequiredPermission = Permissions.Reports.View,
            SupportedFilters = ["DateRange", "WorkLocation", "Employee", "Department", "Search"]
        },
        new()
        {
            Id = "lateness-absence",
            Category = "Attendance",
            ReportType = "ledger",
            NameEn = "Lateness & Absence Exceptions",
            NameAr = "تقرير التأخيرات والغياب والاستثناءات",
            DescriptionEn = "Log of late check-ins, after-cutoff arrivals with Black Card markers, missing check-outs, and pending review cases.",
            DescriptionAr = "سجل حالات التأخير والحضور بعد المهلة مع البطاقة السوداء وسجلات الانصراف المفقودة وحالات قيد المراجعة.",
            RequiredPermission = Permissions.Reports.View,
            SupportedFilters = ["DateRange", "WorkLocation", "WorkShift", "Employee", "Department", "Search"]
        },
        new()
        {
            Id = "points-penalties",
            Category = "Points",
            ReportType = "ledger",
            NameEn = "Points & Penalties Ledger",
            NameAr = "سجل النقاط والجزاءات التراكمي",
            DescriptionEn = "Full transaction audit log for Green, Red, and Black point transactions with source events and reasons.",
            DescriptionAr = "سجل تدقيق كامل لحركات النقاط الخضراء والحمراء والسوداء مع الأحداث المسببة والأسباب المدونة.",
            RequiredPermission = Permissions.Reports.View,
            SupportedFilters = ["DateRange", "PointCategory", "Employee", "Search"]
        },
        new()
        {
            Id = "disciplinary-summary",
            Category = "Compliance",
            ReportType = "summary",
            NameEn = "Disciplinary Summary (Non-Financial)",
            NameAr = "الملخص التأديبي الإداري (غير المالي)",
            DescriptionEn = "Aggregated disciplinary infractions, Black Card markers, and penalty points. Note: Financial deductions are pending approval under DEC-011/DEC-012.",
            DescriptionAr = "إجمالي المخالفات التأديمية والبطاقات السوداء ونقاط الجزاء. ملاحظة: الخصومات المالية معلقة بانتظار الاعتماد وفق DEC-011/DEC-012.",
            RequiredPermission = Permissions.Reports.View,
            SupportedFilters = ["DateRange", "Department", "Employee", "Search"]
        },
        new()
        {
            Id = "employee-operational",
            Category = "Workforce",
            ReportType = "directory",
            NameEn = "Employee Operational Directory",
            NameAr = "السجل التشغيلي الشامل للموظفين",
            DescriptionEn = "Comprehensive workforce directory with location, shift assignment, supervisor, total hours, leaves, and point balance.",
            DescriptionAr = "دليل القوى العاملة الشامل مع مواقع العمل والورديات والمشرفين وإجمالي الساعات والإجازات ورصيد النقاط.",
            RequiredPermission = Permissions.Reports.View,
            SupportedFilters = ["WorkLocation", "Department", "Search"]
        },
        new()
        {
            Id = "leave-report",
            Category = "Leaves",
            ReportType = "summary",
            NameEn = "Leave Requests & Balances",
            NameAr = "تقرير الإجازات والاستئذانات",
            DescriptionEn = "Administrative log of leave applications, approved leave days, paid/unpaid status, and approval audit history.",
            DescriptionAr = "سجل طلبات الإجازات المعتمدة والمعلقة مع تصنيف مدفوعة/غير مدفوعة وتاريخ المراجعة والاعتماد.",
            RequiredPermission = Permissions.Reports.View,
            SupportedFilters = ["DateRange", "Department", "Employee", "Status", "Search"]
        },
        new()
        {
            Id = "rewards-claims",
            Category = "Rewards",
            ReportType = "statement",
            NameEn = "Reward Claims (Deferred Integration)",
            NameAr = "مطالبات المكافآت النقدية (تكامل مؤجل)",
            DescriptionEn = "Reward claim status and point reservations. (Status: Deferred pending MOD-08 Cash Rewards integration).",
            DescriptionAr = "حالات مطالبات المكافآت وحجز النقاط. (الحالة: تكامل مؤجل بانتظار اكتمال موديول MOD-08).",
            RequiredPermission = Permissions.Reports.View,
            SupportedFilters = ["DateRange", "Employee", "Search"]
        }
    ];

    public Task<GenericBaseResponse<IReadOnlyList<ReportCatalogItemDto>>> Handle(
        GetReportCatalogQuery request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(GenericBaseResponse<IReadOnlyList<ReportCatalogItemDto>>.Success(Catalog));
    }
}
