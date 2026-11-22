using FluentValidation;

namespace Application.Features.Auth.Commands.AdminDirectChangePassword;

public class AdminDirectChangePasswordValidator : AbstractValidator<AdminDirectChangePasswordCommand>
{
    public AdminDirectChangePasswordValidator()
    {
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(8).WithMessage("New password must be at least 8 characters long.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.NewPassword).WithMessage("New password and confirmation password do not match.");
    }
}
