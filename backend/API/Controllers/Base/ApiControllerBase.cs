namespace API.Controllers.Base;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{

   public const string MultipartFormData = "multipart/form-data";

    private IMediator? _mediatorInstance;

    protected IMediator _mediator =>
        _mediatorInstance ??=
            HttpContext.RequestServices.GetRequiredService<IMediator>();

    #region Actions
    public ObjectResult ActionResult<T>(GenericBaseResponse<T>? response)
    {
        if (response is null)
        {
            return new ObjectResult(null)
            {
                StatusCode = (int)HttpStatusCode.InternalServerError
            };
        }

        if (response.StatusCode == HttpStatusCode.NoContent)
        {
            return new ObjectResult(null)
            {
                StatusCode = (int)HttpStatusCode.NoContent
            };
        }

        return response.StatusCode switch
        {
            HttpStatusCode.OK => new OkObjectResult(response),
            HttpStatusCode.Created => new CreatedResult(string.Empty, response),
            HttpStatusCode.Accepted => new AcceptedResult(string.Empty, response),
            HttpStatusCode.BadRequest => new BadRequestObjectResult(response),
            HttpStatusCode.Unauthorized => new UnauthorizedObjectResult(response),
            HttpStatusCode.NotFound => new NotFoundObjectResult(response),
            HttpStatusCode.Conflict => new ConflictObjectResult(response),
            HttpStatusCode.UnprocessableEntity => new UnprocessableEntityObjectResult(response),
            _ => new ObjectResult(response)
            {
                StatusCode = (int)response.StatusCode
            }
        };
    }
    #endregion
}
