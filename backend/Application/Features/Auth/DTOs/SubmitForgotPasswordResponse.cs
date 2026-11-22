namespace Application.Features.Auth.DTOs;

public class SubmitForgotPasswordResponse
{
    public bool Submitted { get; set; }
    public string Message { get; set; } = string.Empty;
}
