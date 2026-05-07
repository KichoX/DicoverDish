using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DiscoverDish.Api.Data;
using DiscoverDish.Api.DTOs.Auth;
using DiscoverDish.Api.DTOs.User;
using DiscoverDish.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DiscoverDish.Api.Services;

public class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Client
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return await IssueTokensAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower())
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return await IssueTokensAsync(user);
    }

    public async Task<TokenResponse> RefreshAsync(string refreshToken)
    {
        var stored = await db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Refresh token expired or revoked.");

        stored.IsRevoked = true;
        var newRefresh = CreateRefreshToken(stored.UserId);
        db.RefreshTokens.Add(newRefresh);
        await db.SaveChangesAsync();

        var accessToken = CreateAccessToken(stored.User);
        return new TokenResponse(accessToken, newRefresh.Token);
    }

    public async Task RevokeAsync(string refreshToken)
    {
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (stored is null) return;
        stored.IsRevoked = true;
        await db.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    public async Task<UserDto> GetUserAsync(Guid userId)
    {
        var user = await db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");
        return await MapUserAsync(user);
    }

    private async Task<AuthResponse> IssueTokensAsync(User user)
    {
        var accessToken = CreateAccessToken(user);
        var refreshToken = CreateRefreshToken(user.Id);
        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();
        return new AuthResponse(accessToken, refreshToken.Token, await MapUserAsync(user));
    }

    private async Task<UserDto> MapUserAsync(User u)
    {
        string? slug = null;
        if (u.RestaurantId.HasValue)
        {
            slug = await db.Restaurants
                .Where(r => r.Id == u.RestaurantId.Value)
                .Select(r => r.Slug)
                .FirstOrDefaultAsync();
        }
        return new UserDto(u.Id, u.Name, u.Email, u.Role.ToString(), u.CreatedAt, u.RestaurantId, slug);
    }

    private string CreateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(int.Parse(config["Jwt:AccessTokenExpiryMinutes"]!));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (user.RestaurantId.HasValue)
            claims.Add(new Claim("restaurantId", user.RestaurantId.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static RefreshToken CreateRefreshToken(Guid userId) => new()
    {
        UserId = userId,
        Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
        ExpiresAt = DateTime.UtcNow.AddDays(30)
    };

}
