using FluentValidation;

namespace Application.Features.Reports.Queries.ExecuteReport;

public sealed class ExecuteReportValidator : AbstractValidator<ExecuteReportQuery>
{
    public ExecuteReportValidator()
    {
        RuleFor(x => x.Filter)
            .NotNull().WithMessage("Report filter request is required.");

        RuleFor(x => x.Filter.ReportId)
            .NotEmpty().WithMessage("Report ID is required.");

        RuleFor(x => x.Filter)
            .Must(f => !f.FromDate.HasValue || !f.ToDate.HasValue || f.ToDate.Value >= f.FromDate.Value)
            .WithMessage("End date must be on or after start date.");
    }
}
