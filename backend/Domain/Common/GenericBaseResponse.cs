using System.Net;

namespace Domain.Common;

public class GenericBaseResponse<T>
{
    public GenericBaseResponse()
    {
    }

    public GenericBaseResponse(T data, string? message = null)
    {
        Succeeded = true;
        StatusCode = HttpStatusCode.OK;
        Message = message;
        Data = data;
    }

    public GenericBaseResponse(string message)
    {
        Succeeded = false;
        StatusCode = HttpStatusCode.BadRequest;
        Message = message;
    }

    public GenericBaseResponse(bool succeeded, string message)
    {
        Succeeded = succeeded;
        StatusCode = succeeded ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
        Message = message;
    }

    public GenericBaseResponse(
        bool succeeded,
        HttpStatusCode statusCode,
        string? message,
        T? data,
        List<string>? errors,
        object? meta)
    {
        StatusCode = statusCode;
        Meta = meta;
        Message = message;
        Succeeded = succeeded;
        Errors = errors;
        Data = data;
    }

    public HttpStatusCode StatusCode { get; set; }
    public object? Meta { get; set; }
    public string? Message { get; set; }
    public bool Succeeded { get; set; }
    public List<string>? Errors { get; set; }
    public List<ValidationError>? ValidationErrors { get; set; }
    public T? Data { get; set; }

    public static GenericBaseResponse<T> Success(T? data, string? message = null, object? meta = null) => new()
    {
        Succeeded = true,
        StatusCode = HttpStatusCode.OK,
        Message = message,
        Data = data,
        Meta = meta
    };

    public static GenericBaseResponse<T> Created(T? data, string? message = null) => new()
    {
        Succeeded = true,
        StatusCode = HttpStatusCode.Created,
        Message = message,
        Data = data
    };

    public static GenericBaseResponse<T> Fail(
        string message,
        HttpStatusCode statusCode = HttpStatusCode.BadRequest,
        List<string>? errors = null,
        List<ValidationError>? validationErrors = null) => new()
    {
        Succeeded = false,
        StatusCode = statusCode,
        Message = message,
        Errors = errors ?? validationErrors?.Select(v => v.Description).ToList(),
        ValidationErrors = validationErrors
    };

    public static GenericBaseResponse<T> ValidationFail(
        List<ValidationError> validationErrors,
        string message = "Please check the data below",
        HttpStatusCode statusCode = HttpStatusCode.BadRequest) => new()
    {
        Succeeded = false,
        StatusCode = statusCode,
        Message = message,
        Errors = validationErrors.Select(v => v.Description).ToList(),
        ValidationErrors = validationErrors
    };

    public static GenericBaseResponse<T> NotFound(string message = "Resource not found") =>
        Fail(message, HttpStatusCode.NotFound);

    public static GenericBaseResponse<T> Unauthorized(string message = "Unauthorized") =>
        Fail(message, HttpStatusCode.Unauthorized);

    public static GenericBaseResponse<T> Conflict(string message = "Conflict") =>
        Fail(message, HttpStatusCode.Conflict);
}
