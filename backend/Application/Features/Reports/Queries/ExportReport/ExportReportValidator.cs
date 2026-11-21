using FluentValidation;

namespace Application.Features.Reports.Queries.ExportReport;

public sealed class ExportReportValidator : AbstractValidator<ExportReportQuery>
{
    private static readonly string[] SupportedFormats = ["csv", "xlsx", "pdf"];

    public ExportReportValidator()
    {
        RuleFor(x => x.Filter)
            .NotNull().WithMessage("Report filter request is required.");

        RuleFor(x => x.Filter.ReportId)
            .NotEmpty().WithMessage("Report ID is required.");

        RuleFor(x => x.Filter.ExportFormat)
            .Must(f => string.IsNullOrEmpty(f) || SupportedFormats.Contains(f.ToLowerInvariant()))
            .WithMessage("Export format must be one of: csv, xlsx, pdf.");
    }
}
