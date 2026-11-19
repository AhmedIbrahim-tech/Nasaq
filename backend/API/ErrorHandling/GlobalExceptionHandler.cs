using Domain.Common;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using System.Net;

namespace API.ErrorHandling;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment environment)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, message, errors) = exception switch
        {
            ValidationException validation => (
                HttpStatusCode.BadRequest,
                "Please review the provided information and correct the validation errors before continuing.",
                validation.Errors.Select(e => e.ErrorMessage).ToList()
            ),

            KeyNotFoundException => (
                HttpStatusCode.NotFound,
                "The requested resource could not be found or is not available to your organization.",
                new List<string> { exception.Message }
            ),

            UnauthorizedAccessException => (
                HttpStatusCode.Forbidden,
                "You do not have permission to perform this action.",
                new List<string> { exception.Message }
            ),

            InvalidOperationException => (
                HttpStatusCode.BadRequest,
                string.IsNullOrWhiteSpace(exception.Message)
                    ? "The requested operation could not be completed with the current system state."
                    : exception.Message,
                new List<string> { exception.Message }
            ),

            _ => (
                HttpStatusCode.InternalServerError,
                "We couldn't complete your request due to an unexpected server error. Please try again later.",
                new List<string> { environment.IsDevelopment() ? exception.Message : "An unexpected server error occurred." }
            )
        };

        if (status == HttpStatusCode.InternalServerError)
        {
            logger.LogError(exception, "Unhandled server error processing request: {Path}", httpContext.Request.Path);
        }
        else
        {
            logger.LogWarning("Handled request exception {StatusCode} at {Path}: {Message}", (int)status, httpContext.Request.Path, message);
        }

        List<ValidationError>? validationErrors = exception is ValidationException valEx
            ? valEx.Errors.Select(e => new ValidationError(e.PropertyName, e.ErrorMessage)).ToList()
            : null;

        var body = GenericBaseResponse<object?>.Fail(message, status, errors, validationErrors);
        httpContext.Response.StatusCode = (int)status;
        httpContext.Response.ContentType = "application/json";
        await httpContext.Response.WriteAsJsonAsync(body, cancellationToken);
        return true;
    }
}
