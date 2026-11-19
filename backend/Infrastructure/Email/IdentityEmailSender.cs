using Application.Abstractions;
using Application.Email;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace Infrastructure.Email;

public sealed class IdentityEmailSender : IEmailSender
{
    private readonly IEmailService _emailService;

    public IdentityEmailSender(IEmailService emailService) => _emailService = emailService;

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        await _emailService.SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = htmlMessage,
            IsHtml = true
        });
    }
}
