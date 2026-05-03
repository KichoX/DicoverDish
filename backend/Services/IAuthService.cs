using DiscoverDish.Api.DTOs.Auth;

namespace DiscoverDish.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<TokenResponse> RefreshAsync(string refreshToken);
    Task RevokeAsync(string refreshToken);
}
