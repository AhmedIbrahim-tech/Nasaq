using Domain.Common;
using Domain.DTOs.Auth;

namespace Application.Abstractions;

public interface IAuthService
{
    Task<GenericBaseResponse<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<AuthResponse>> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<object?>> LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<CurrentUserResponse>> GetCurrentUserAsync(string? userId, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<CurrentUserResponse>> UpdateProfileAsync(string? userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<bool>> ChangePasswordAsync(string? userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<AuthResponse>> FirstLoginChangePasswordAsync(FirstLoginChangePasswordRequest request, CancellationToken cancellationToken = default);
}
