using DiscoverDish.Api.DTOs.Auth;
using DiscoverDish.Api.DTOs.User;

namespace DiscoverDish.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<TokenResponse> RefreshAsync(string refreshToken);
    Task RevokeAsync(string refreshToken);
    Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    Task<UserDto> GetUserAsync(Guid userId);
}
