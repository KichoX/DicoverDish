using System.Security.Claims;
using DiscoverDish.Api.DTOs.Auth;
using DiscoverDish.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscoverDish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var result = await authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponse>> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await authService.RefreshAsync(request.RefreshToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequest request)
    {
        await authService.RevokeAsync(request.RefreshToken);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);
        var user = await authService.GetUserAsync(userId);
        return Ok(user);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);
        await authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
        return NoContent();
    }
}
