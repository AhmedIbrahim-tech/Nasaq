using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Domain.Common;
using FluentValidation;
using MediatR;

namespace Application.Common.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(
            validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count != 0)
        {
            var validationErrors = failures
                .Select(f => new ValidationError(f.PropertyName, f.ErrorMessage))
                .ToList();

            // If TResponse is GenericBaseResponse<T>, construct and return standard structured error response
            if (typeof(TResponse).IsGenericType &&
                typeof(TResponse).GetGenericTypeDefinition() == typeof(GenericBaseResponse<>))
            {
                var responseType = typeof(TResponse);
                var response = Activator.CreateInstance(responseType);
                if (response != null)
                {
                    var succeededProp = responseType.GetProperty(nameof(GenericBaseResponse<object>.Succeeded));
                    var statusCodeProp = responseType.GetProperty(nameof(GenericBaseResponse<object>.StatusCode));
                    var messageProp = responseType.GetProperty(nameof(GenericBaseResponse<object>.Message));
                    var errorsProp = responseType.GetProperty(nameof(GenericBaseResponse<object>.Errors));
                    var validationErrorsProp = responseType.GetProperty(nameof(GenericBaseResponse<object>.ValidationErrors));

                    succeededProp?.SetValue(response, false);
                    statusCodeProp?.SetValue(response, HttpStatusCode.BadRequest);
                    messageProp?.SetValue(response, validationErrors.Count == 1 ? validationErrors[0].Description : "Please check the data below");
                    errorsProp?.SetValue(response, validationErrors.Select(v => v.Description).ToList());
                    validationErrorsProp?.SetValue(response, validationErrors);

                    return (TResponse)response;
                }
            }

            throw new ValidationException(failures);
        }

        return await next();
    }
}
