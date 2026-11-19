using System.Linq;
using System.Net;
using Domain.Common;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Filters;

public sealed class FluentValidationFilter(IServiceProvider serviceProvider) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null)
                continue;

            var argumentType = argument.GetType();
            var validatorType = typeof(IValidator<>).MakeGenericType(argumentType);
            var validator = serviceProvider.GetService(validatorType) as IValidator;

            if (validator != null)
            {
                BindRouteValuesToArgument(context, argument);

                var validationContext = new ValidationContext<object>(argument);
                var validationResult = await validator.ValidateAsync(validationContext, context.HttpContext.RequestAborted);

                if (!validationResult.IsValid)
                {
                    var validationErrors = validationResult.Errors
                        .Select(e => new ValidationError(e.PropertyName, e.ErrorMessage))
                        .ToList();

                    var errorMessages = validationResult.Errors
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    var body = GenericBaseResponse<object?>.Fail(
                        "Please review the provided information and correct the validation errors before continuing.",
                        HttpStatusCode.BadRequest,
                        errorMessages,
                        validationErrors);

                    context.Result = new BadRequestObjectResult(body);
                    return;
                }
            }
        }

        ActionExecutedContext? executedContext = null;
        try
        {
            executedContext = await next();
        }
        catch (ValidationException ex)
        {
            var validationErrors = ex.Errors
                .Select(e => new ValidationError(e.PropertyName, e.ErrorMessage))
                .ToList();

            var errorMessages = ex.Errors
                .Select(e => e.ErrorMessage)
                .ToList();

            var body = GenericBaseResponse<object?>.Fail(
                "Please review the provided information and correct the validation errors before continuing.",
                HttpStatusCode.BadRequest,
                errorMessages,
                validationErrors);

            context.Result = new BadRequestObjectResult(body);
            return;
        }

        if (executedContext?.Exception is ValidationException valEx && !executedContext.ExceptionHandled)
        {
            var validationErrors = valEx.Errors
                .Select(e => new ValidationError(e.PropertyName, e.ErrorMessage))
                .ToList();

            var errorMessages = valEx.Errors
                .Select(e => e.ErrorMessage)
                .ToList();

            var body = GenericBaseResponse<object?>.Fail(
                "Please review the provided information and correct the validation errors before continuing.",
                HttpStatusCode.BadRequest,
                errorMessages,
                validationErrors);

            executedContext.Result = new BadRequestObjectResult(body);
            executedContext.ExceptionHandled = true;
        }
    }

    private static void BindRouteValuesToArgument(ActionExecutingContext context, object argument)
    {
        if (context.RouteData.Values.Count == 0)
            return;

        var argumentType = argument.GetType();
        var properties = argumentType.GetProperties();

        foreach (var (routeKey, routeVal) in context.RouteData.Values)
        {
            if (routeVal is null)
                continue;

            var routeStr = routeVal.ToString();
            if (string.IsNullOrWhiteSpace(routeStr))
                continue;

            var property = properties.FirstOrDefault(p =>
                string.Equals(p.Name, routeKey, StringComparison.OrdinalIgnoreCase) ||
                (string.Equals(routeKey, "id", StringComparison.OrdinalIgnoreCase) &&
                 string.Equals(p.Name, "UserId", StringComparison.OrdinalIgnoreCase)));

            if (property is null)
                continue;

            try
            {
                if (property.PropertyType == typeof(string))
                {
                    var currentVal = property.GetValue(argument) as string;
                    if (string.IsNullOrWhiteSpace(currentVal))
                    {
                        property.SetValue(argument, routeStr);
                    }
                }
                else if (property.PropertyType == typeof(Guid) || property.PropertyType == typeof(Guid?))
                {
                    var currentVal = property.GetValue(argument);
                    if (currentVal is null || (currentVal is Guid g && g == Guid.Empty))
                    {
                        if (Guid.TryParse(routeStr, out var parsedGuid))
                        {
                            property.SetValue(argument, parsedGuid);
                        }
                    }
                }
            }
            catch
            {
                // Ignore if property cannot be assigned via reflection
            }
        }
    }
}
