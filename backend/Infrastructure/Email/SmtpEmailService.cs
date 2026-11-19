using Application.Abstractions;
using Application.Configuration;
using Application.Email;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace Infrastructure.Email;

public sealed class SmtpEmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<EmailOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<EmailSendResult> SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("Email disabled; skipping send to {To} subject {Subject}", message.To, message.Subject);
            return EmailSendResult.Ok();
        }

        if (string.IsNullOrWhiteSpace(_options.SmtpHost))
        {
            _logger.LogWarning("Email enabled but SmtpHost is empty.");
            return EmailSendResult.Fail("SMTP host is not configured.");
        }

        try
        {
            using var mail = new MailMessage
            {
                From = new MailAddress(
                    message.FromAddress ?? _options.DefaultFromAddress,
                    message.FromName ?? _options.DefaultFromName),
                Subject = message.Subject,
                Body = message.Body,
                IsBodyHtml = message.IsHtml
            };
            mail.To.Add(message.To);
            if (!string.IsNullOrWhiteSpace(message.Cc))
                mail.CC.Add(message.Cc);
            if (!string.IsNullOrWhiteSpace(message.Bcc))
                mail.Bcc.Add(message.Bcc);

            using var client = new SmtpClient(_options.SmtpHost, _options.SmtpPort)
            {
                EnableSsl = _options.UseSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };
            if (!string.IsNullOrEmpty(_options.UserName))
                client.Credentials = new NetworkCredential(_options.UserName, _options.Password);

            await client.SendMailAsync(mail, cancellationToken);
            return EmailSendResult.Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", message.To);
            return EmailSendResult.Fail(ex.Message);
        }
    }
}
