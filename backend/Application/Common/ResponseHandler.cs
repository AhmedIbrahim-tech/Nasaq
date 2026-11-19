using Domain.Common;

namespace Application.Common;

public class ResponseHandler
{
    public GenericBaseResponse<T> Success<T>(T? data, string? message = null) =>
        GenericBaseResponse<T>.Success(data, message);

    public GenericBaseResponse<IReadOnlyList<T>> SuccessList<T>(IEnumerable<T> items, string? message = null) =>
        GenericBaseResponse<IReadOnlyList<T>>.Success(items.ToList(), message);

    public GenericBaseResponse<T> Created<T>(T? data, string? message = null) =>
        GenericBaseResponse<T>.Created(data, message);

    public GenericBaseResponse<T> NotFound<T>(string message = "Resource not found") =>
        GenericBaseResponse<T>.NotFound(message);

    public GenericBaseResponse<T> Fail<T>(string message) =>
        GenericBaseResponse<T>.Fail(message);

    public GenericBaseResponse<T> Fail<T>(
        string message,
        System.Net.HttpStatusCode statusCode,
        List<string>? errors = null,
        List<ValidationError>? validationErrors = null) =>
        GenericBaseResponse<T>.Fail(message, statusCode, errors, validationErrors);

    public GenericBaseResponse<T> ValidationFail<T>(
        List<ValidationError> validationErrors,
        string message = "Please check the data below") =>
        GenericBaseResponse<T>.ValidationFail(validationErrors, message);

    public GenericBaseResponse<T> Conflict<T>(string message = "Operation conflict") =>
        GenericBaseResponse<T>.Fail(message, System.Net.HttpStatusCode.Conflict);

    public GenericBaseResponse<T> Unauthorized<T>(string message = "Unauthorized") =>
        GenericBaseResponse<T>.Unauthorized(message);

    public GenericBaseResponse<T> Forbidden<T>(string message = "Forbidden") =>
        GenericBaseResponse<T>.Fail(message, System.Net.HttpStatusCode.Forbidden);
}

