using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using Application.Features.Reports.DTOs;
using ClosedXML.Excel;
using QuestPDF.Drawing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Application.Features.Reports.Exporting;

public static class ReportExportEngine
{
    private static readonly object _fontInitLock = new();
    private static bool _fontsInitialized;

    public static void InitializeFonts()
    {
        if (_fontsInitialized) return;
        lock (_fontInitLock)
        {
            if (_fontsInitialized) return;

            QuestPDF.Settings.License = LicenseType.Community;

            var candidatePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "Resources", "Fonts"),
                Path.Combine(AppContext.BaseDirectory, "Fonts"),
                Path.Combine(Directory.GetCurrentDirectory(), "Resources", "Fonts")
            };

            foreach (var dir in candidatePaths)
            {
                if (Directory.Exists(dir))
                {
                    foreach (var fontFile in Directory.GetFiles(dir, "*.ttf"))
                    {
                        try
                        {
                            FontManager.RegisterFontFromFile(fontFile);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[FONT ERROR] Failed to register {fontFile}: {ex.Message}");
                        }
                    }
                    break;
                }
            }

            _fontsInitialized = true;
        }
    }

    public static byte[] ExportCsv(ReportResultDto report, ReportFilterRequest req)
    {
        var isAr = req.Language?.ToLowerInvariant() != "en";
        var rowsToExport = GetRowsToExport(report.Rows, req);

        using var memoryStream = new MemoryStream();
        using (var writer = new StreamWriter(memoryStream, new UTF8Encoding(true)))
        {
            // Title & Metadata
            var title = isAr ? report.ReportNameAr : report.ReportNameEn;
            writer.WriteLine(SanitizeCsvField(title));
            writer.WriteLine(SanitizeCsvField($"CoreStarter - {(isAr ? "نظام إدارة الموارد" : "Enterprise Application Template")}"));
            writer.WriteLine(SanitizeCsvField($"Generated: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC"));
            writer.WriteLine(SanitizeCsvField($"Scope: {(req.ExportScope == "current_page" ? $"Current Page ({rowsToExport.Count} records)" : $"All Filtered Results ({rowsToExport.Count} records)")}"));
            writer.WriteLine();

            // Header Row
            var headerLine = new StringBuilder();
            for (var i = 0; i < report.Columns.Count; i++)
            {
                if (i > 0) headerLine.Append(',');
                var col = report.Columns[i];
                var label = isAr ? col.LabelAr : col.LabelEn;
                headerLine.Append(SanitizeCsvField(label));
            }
            writer.WriteLine(headerLine.ToString());

            // Data Rows
            foreach (var row in rowsToExport)
            {
                var rowLine = new StringBuilder();
                for (var i = 0; i < report.Columns.Count; i++)
                {
                    if (i > 0) rowLine.Append(',');
                    var col = report.Columns[i];
                    row.TryGetValue(col.Key, out var val);
                    var valStr = FormatFieldValue(val, col.Type, isAr);
                    rowLine.Append(SanitizeCsvField(valStr));
                }
                writer.WriteLine(rowLine.ToString());
            }

            // Summary KPIs
            if (report.SummaryKpis.Count > 0)
            {
                writer.WriteLine();
                writer.WriteLine(SanitizeCsvField(isAr ? "--- المؤشرات الإجمالية ---" : "--- Summary KPIs ---"));
                foreach (var kpi in report.SummaryKpis)
                {
                    var kpiLabel = isAr ? kpi.LabelAr : kpi.LabelEn;
                    var kpiVal = kpi.Type == "currency"
                        ? kpi.Value.ToString("N2", CultureInfo.InvariantCulture)
                        : kpi.Value.ToString("N0", CultureInfo.InvariantCulture);
                    writer.WriteLine($"{SanitizeCsvField(kpiLabel)},{SanitizeCsvField(kpiVal)}");
                }
            }

            writer.Flush();
        }

        return memoryStream.ToArray();
    }

    public static byte[] ExportExcel(ReportResultDto report, ReportFilterRequest req)
    {
        var isAr = req.Language?.ToLowerInvariant() != "en";
        var rowsToExport = GetRowsToExport(report.Rows, req);

        using var workbook = new XLWorkbook();
        var sheetName = CleanSheetName(isAr ? report.ReportNameAr : report.ReportNameEn);
        var ws = workbook.Worksheets.Add(sheetName);

        if (isAr)
        {
            ws.RightToLeft = true;
        }

        var colCount = Math.Max(report.Columns.Count, 4);

        // 1. Report Title Header Block
        var titleText = isAr ? report.ReportNameAr : report.ReportNameEn;
        ws.Cell(1, 1).Value = $"CoreStarter — {titleText}";
        ws.Range(1, 1, 1, colCount).Merge();
        ws.Row(1).Height = 28;
        ws.Cell(1, 1).Style.Font.Bold = true;
        ws.Cell(1, 1).Style.Font.FontSize = 14;
        ws.Cell(1, 1).Style.Font.FontColor = XLColor.White;
        ws.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#1E3A8A");
        ws.Cell(1, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        ws.Cell(1, 1).Style.Alignment.Horizontal = isAr ? XLAlignmentHorizontalValues.Right : XLAlignmentHorizontalValues.Left;

        // 2. Metadata line
        var scopeText = req.ExportScope == "current_page"
            ? (isAr ? $"الصفحة الحالية ({rowsToExport.Count} سجل)" : $"Current Page ({rowsToExport.Count} records)")
            : (isAr ? $"كافة النتائج المطابقة ({rowsToExport.Count} سجل)" : $"All Filtered Results ({rowsToExport.Count} records)");

        var metaText = isAr
            ? $"تاريخ التوليد: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC  |  النطاق: {scopeText}"
            : $"Generated At: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC  |  Scope: {scopeText}";

        ws.Cell(2, 1).Value = metaText;
        ws.Range(2, 1, 2, colCount).Merge();
        ws.Row(2).Height = 20;
        ws.Cell(2, 1).Style.Font.FontSize = 9;
        ws.Cell(2, 1).Style.Font.FontColor = XLColor.FromHtml("#475569");
        ws.Cell(2, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

        // Row 3: Blank separator
        ws.Row(3).Height = 10;

        // 3. Table Headers (Row 4)
        var headerRow = 4;
        ws.Row(headerRow).Height = 24;
        for (var c = 0; c < report.Columns.Count; c++)
        {
            var col = report.Columns[c];
            var cell = ws.Cell(headerRow, c + 1);
            cell.Value = isAr ? col.LabelAr : col.LabelEn;
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 10;
            cell.Style.Font.FontColor = XLColor.FromHtml("#0F172A");
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#F1F5F9");
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Medium;
            cell.Style.Border.BottomBorderColor = XLColor.FromHtml("#94A3B8");
            cell.Style.Border.TopBorder = XLBorderStyleValues.Thin;
            cell.Style.Border.TopBorderColor = XLColor.FromHtml("#CBD5E1");
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Alignment.Horizontal = GetExcelAlignment(col.Align, col.Type);
        }

        // 4. Data Rows
        var currentRow = headerRow + 1;
        foreach (var row in rowsToExport)
        {
            ws.Row(currentRow).Height = 20;
            for (var c = 0; c < report.Columns.Count; c++)
            {
                var col = report.Columns[c];
                var cell = ws.Cell(currentRow, c + 1);
                row.TryGetValue(col.Key, out var rawVal);

                SetExcelCellValue(cell, rawVal, col.Type);
                cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.BottomBorderColor = XLColor.FromHtml("#E2E8F0");
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Alignment.Horizontal = GetExcelAlignment(col.Align, col.Type);
            }
            currentRow++;
        }

        // 5. Summary KPIs Block (below table)
        if (report.SummaryKpis.Count > 0)
        {
            currentRow++;
            ws.Cell(currentRow, 1).Value = isAr ? "المؤشرات الإجمالية" : "Summary Totals";
            ws.Cell(currentRow, 1).Style.Font.Bold = true;
            ws.Cell(currentRow, 1).Style.Font.FontSize = 11;
            currentRow++;

            foreach (var kpi in report.SummaryKpis)
            {
                ws.Cell(currentRow, 1).Value = isAr ? kpi.LabelAr : kpi.LabelEn;
                ws.Cell(currentRow, 1).Style.Font.FontColor = XLColor.FromHtml("#475569");
                var valCell = ws.Cell(currentRow, 2);
                valCell.Value = (double)kpi.Value;
                valCell.Style.Font.Bold = true;
                if (kpi.Type == "currency")
                {
                    valCell.Style.NumberFormat.Format = "#,##0.00";
                }
                else
                {
                    valCell.Style.NumberFormat.Format = "#,##0";
                }
                currentRow++;
            }
        }

        // 6. Polish
        ws.Columns().AdjustToContents(1, currentRow, 10, 45);
        ws.SheetView.FreezeRows(headerRow);
        if (rowsToExport.Count > 0)
        {
            ws.Range(headerRow, 1, headerRow + rowsToExport.Count, report.Columns.Count).SetAutoFilter();
        }

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    public static byte[] ExportPdf(ReportResultDto report, ReportFilterRequest req)
    {
        InitializeFonts();

        var isAr = req.Language?.ToLowerInvariant() != "en";
        var rowsToExport = GetRowsToExport(report.Rows, req);
        var isLandscape = report.Columns.Count > 7;

        var titleText = isAr ? report.ReportNameAr : report.ReportNameEn;
        var scopeText = req.ExportScope == "current_page"
            ? (isAr ? $"الصفحة الحالية ({rowsToExport.Count} سجل)" : $"Current Page ({rowsToExport.Count} records)")
            : (isAr ? $"كافة النتائج المطابقة ({rowsToExport.Count} سجل)" : $"All Filtered Results ({rowsToExport.Count} records)");

        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(isLandscape ? PageSizes.A4.Landscape() : PageSizes.A4);
                page.Margin(20);

                if (isAr)
                {
                    page.ContentFromRightToLeft();
                    page.DefaultTextStyle(x => x.FontFamily("Noto Sans Arabic").FontSize(8.5f));
                }
                else
                {
                    page.ContentFromLeftToRight();
                    page.DefaultTextStyle(x => x.FontFamily("Lato").FontSize(8.5f));
                }

                // Page Header
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text(titleText).Bold().FontSize(14).FontColor("#1E3A8A");
                            c.Item().Text($"CoreStarter - {(isAr ? "نظام إدارة الأعمال" : "Enterprise Application Template")}")
                                .FontSize(8).FontColor("#64748B");
                        });

                        row.ConstantItem(180).AlignRight().Column(c =>
                        {
                            c.Item().Text($"{report.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC").FontSize(8).FontColor("#64748B");
                            c.Item().Text(scopeText).FontSize(8).Bold().FontColor("#0F172A");
                        });
                    });

                    // Summary KPI chips in header
                    if (report.SummaryKpis.Count > 0)
                    {
                        col.Item().PaddingTop(6).PaddingBottom(6).Row(kpiRow =>
                        {
                            foreach (var kpi in report.SummaryKpis.Take(4))
                            {
                                kpiRow.RelativeItem().Border(1).BorderColor("#E2E8F0").Background("#F8FAFC").Padding(4).Column(c =>
                                {
                                    c.Item().Text(isAr ? kpi.LabelAr : kpi.LabelEn).FontSize(7).FontColor("#64748B");
                                    var valStr = kpi.Type == "currency"
                                        ? kpi.Value.ToString("N2", CultureInfo.InvariantCulture)
                                        : kpi.Value.ToString("N0", CultureInfo.InvariantCulture);
                                    c.Item().Text(valStr).Bold().FontSize(9).FontColor("#0F172A");
                                });
                            }
                        });
                    }

                    col.Item().PaddingBottom(4).LineHorizontal(1).LineColor("#CBD5E1");
                });

                // Page Content: Table
                page.Content().Table(table =>
                {
                    // Define column widths
                    table.ColumnsDefinition(cols =>
                    {
                        for (var i = 0; i < report.Columns.Count; i++)
                        {
                            var col = report.Columns[i];
                            if (col.Type == "currency") cols.RelativeColumn(1.3f);
                            else if (col.Type == "number") cols.RelativeColumn(0.9f);
                            else if (col.Type == "date") cols.RelativeColumn(1.1f);
                            else if (col.Type == "badge") cols.RelativeColumn(0.9f);
                            else cols.RelativeColumn(1.5f);
                        }
                    });

                    // Repeating Header
                    table.Header(header =>
                    {
                        for (var i = 0; i < report.Columns.Count; i++)
                        {
                            var col = report.Columns[i];
                            var cell = header.Cell().Background("#1E3A8A").Padding(4);
                            var text = cell.Text(isAr ? col.LabelAr : col.LabelEn).Bold().FontSize(8).FontColor("#FFFFFF");
                            if (col.Align == "right" || col.Type == "currency" || col.Type == "number")
                                text.AlignRight();
                            else if (col.Align == "left")
                                text.AlignLeft();
                            else if (col.Align == "center" || col.Type == "date" || col.Type == "badge")
                                text.AlignCenter();
                            else if (isAr)
                                text.AlignRight();
                            else
                                text.AlignLeft();
                        }
                    });

                    // Rows
                    for (var r = 0; r < rowsToExport.Count; r++)
                    {
                        var row = rowsToExport[r];
                        var bg = r % 2 == 0 ? "#FFFFFF" : "#F8FAFC";

                        for (var c = 0; c < report.Columns.Count; c++)
                        {
                            var col = report.Columns[c];
                            row.TryGetValue(col.Key, out var rawVal);
                            var cellVal = FormatFieldValue(rawVal, col.Type, isAr);

                            var cell = table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#E2E8F0").Padding(3);
                            var text = cell.Text(cellVal).FontSize(7.5f);

                            if (col.Type == "currency")
                            {
                                text.AlignRight().Bold();
                                if (col.Key == "debit" && Convert.ToDecimal(rawVal ?? 0) > 0) text.FontColor("#2563EB");
                                else if (col.Key == "credit" && Convert.ToDecimal(rawVal ?? 0) > 0) text.FontColor("#16A34A");
                                else if (col.Key == "balance" && Convert.ToDecimal(rawVal ?? 0) < 0) text.FontColor("#DC2626");
                                else text.FontColor("#0F172A");
                            }
                            else if (col.Type == "number")
                            {
                                text.AlignRight();
                            }
                            else if (col.Align == "right")
                            {
                                text.AlignRight();
                            }
                            else if (col.Align == "left")
                            {
                                text.AlignLeft();
                            }
                            else if (col.Align == "center" || col.Type == "date" || col.Type == "badge")
                            {
                                text.AlignCenter();
                            }
                            else if (isAr)
                            {
                                text.AlignRight();
                            }
                            else
                            {
                                text.AlignLeft();
                            }
                        }
                    }
                });

                // Page Footer
                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text(isAr ? "CoreStarter — تقرير نظام معتمد" : "CoreStarter — Official Report")
                        .FontSize(7).FontColor("#94A3B8");

                    row.RelativeItem().AlignRight().Text(text =>
                    {
                        text.Span(isAr ? "صفحة " : "Page ").FontSize(7).FontColor("#94A3B8");
                        text.CurrentPageNumber().FontSize(7).FontColor("#94A3B8");
                        text.Span(isAr ? " من " : " of ").FontSize(7).FontColor("#94A3B8");
                        text.TotalPages().FontSize(7).FontColor("#94A3B8");
                    });
                });
            });
        });

        return doc.GeneratePdf();
    }

    private static List<IDictionary<string, object?>> GetRowsToExport(
        IReadOnlyList<IDictionary<string, object?>> rows,
        ReportFilterRequest req)
    {
        if (req.ExportScope == "current_page")
        {
            var page = Math.Max(1, req.PageNumber);
            var pageSize = req.PageSize > 0 ? req.PageSize : 10;
            return rows.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        }

        return rows.ToList();
    }

    private static string SanitizeCsvField(string? field)
    {
        if (string.IsNullOrEmpty(field))
            return string.Empty;

        // Prevent formula injection
        if (field.StartsWith("=") || field.StartsWith("+") || field.StartsWith("-") || field.StartsWith("@"))
        {
            field = "'" + field;
        }

        var containsSpecial = field.Contains(',') || field.Contains('"') || field.Contains('\n') || field.Contains('\r');
        if (!containsSpecial)
            return field;

        return $"\"{field.Replace("\"", "\"\"")}\"";
    }

    private static void SetExcelCellValue(IXLCell cell, object? val, string colType)
    {
        if (val == null || val == DBNull.Value || string.IsNullOrEmpty(val.ToString()))
        {
            cell.Value = "-";
            return;
        }

        if (colType == "currency")
        {
            if (decimal.TryParse(val.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var num))
            {
                cell.Value = (double)num;
                cell.Style.NumberFormat.Format = "#,##0.00";
                return;
            }
        }
        else if (colType == "number")
        {
            if (double.TryParse(val.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var dNum))
            {
                cell.Value = dNum;
                cell.Style.NumberFormat.Format = "#,##0";
                return;
            }
        }

        var str = val.ToString() ?? string.Empty;
        // Formula injection protection
        if (str.StartsWith("=") || str.StartsWith("+") || str.StartsWith("-") || str.StartsWith("@"))
        {
            str = "'" + str;
        }
        cell.Value = str;
    }

    private static XLAlignmentHorizontalValues GetExcelAlignment(string? align, string colType)
    {
        if (align == "right" || colType == "currency" || colType == "number")
            return XLAlignmentHorizontalValues.Right;
        if (align == "center" || colType == "date" || colType == "badge")
            return XLAlignmentHorizontalValues.Center;
        return XLAlignmentHorizontalValues.Left;
    }

    private static string FormatFieldValue(object? val, string colType, bool isAr)
    {
        if (val == null || val == DBNull.Value || string.IsNullOrEmpty(val.ToString()))
            return "-";

        if (colType == "currency" && decimal.TryParse(val.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var dec))
        {
            return dec.ToString("N2", isAr ? CultureInfo.InvariantCulture : CultureInfo.InvariantCulture);
        }
        if (colType == "number" && double.TryParse(val.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var num))
        {
            return num.ToString("N0", CultureInfo.InvariantCulture);
        }

        return val.ToString() ?? "-";
    }

    private static string CleanSheetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "Report";

        var invalidChars = new[] { ':', '\\', '/', '?', '*', '[', ']' };
        var clean = new string(name.Where(c => !invalidChars.Contains(c)).ToArray());
        return clean.Length > 28 ? clean[..28] : clean;
    }
}
