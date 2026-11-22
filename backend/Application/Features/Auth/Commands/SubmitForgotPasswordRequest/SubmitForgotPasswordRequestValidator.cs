using FluentValidation;

namespace Application.Features.Auth.Commands.SubmitForgotPasswordRequest;

public class SubmitForgotPasswordRequestValidator : AbstractValidator<SubmitForgotPasswordRequestCommand>
{
    public SubmitForgotPasswordRequestValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty()
            .WithMessage("Email or Employee Code is required.");
    }
}
