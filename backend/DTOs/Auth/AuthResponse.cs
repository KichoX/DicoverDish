using DiscoverDish.Api.DTOs.User;

namespace DiscoverDish.Api.DTOs.Auth;

public record AuthResponse(string AccessToken, string RefreshToken, UserDto User);
public record TokenResponse(string AccessToken, string RefreshToken);
public record RefreshTokenRequest(string RefreshToken);
