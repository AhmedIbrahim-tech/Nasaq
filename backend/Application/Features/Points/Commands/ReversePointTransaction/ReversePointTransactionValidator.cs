using FluentValidation;

namespace Application.Features.Points.Commands.ReversePointTransaction;

public class ReversePointTransactionValidator : AbstractValidator<ReversePointTransactionCommand>
{
    public ReversePointTransactionValidator()
    {
        RuleFor(x => x.TransactionId)
            .NotEmpty().WithMessage("Transaction ID is required.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reversal reason is required.")
            .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters.");
    }
}
