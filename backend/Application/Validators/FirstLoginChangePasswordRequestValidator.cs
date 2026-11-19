using Domain.DTOs.Auth;
using FluentValidation;

namespace Application.Validators;

public sealed class FirstLoginChangePasswordRequestValidator : AbstractValidator<FirstLoginChangePasswordRequest>
{
    public FirstLoginChangePasswordRequestValidator()
    {
        RuleFor(x => x.SetupToken)
            .NotEmpty().WithMessage("Setup token is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(6).WithMessage("New password must be at least 6 characters long.");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Password confirmation is required.")
            .Equal(x => x.NewPassword).WithMessage("New password and confirmation password do not match.");
    }
}
