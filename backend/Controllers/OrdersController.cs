using System.Security.Claims;
using DiscoverDish.Api.DTOs.Order;
using DiscoverDish.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscoverDish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create([FromBody] CreateOrderRequest request)
    {
        var userId = GetUserId();
        var result = await orderService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetById(Guid id)
    {
        var order = await orderService.GetByIdAsync(id);
        var userId = GetUserId();
        if (order.UserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Driver"))
            return Forbid();
        return Ok(order);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("restaurant/{restaurantId:guid}")]
    public async Task<ActionResult<List<OrderDto>>> GetByRestaurant(
        Guid restaurantId,
        [FromQuery] string? status)
    {
        return Ok(await orderService.GetByRestaurantAsync(restaurantId, status));
    }

    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<List<OrderDto>>> GetMy()
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        return Ok(await orderService.GetByUserAsync(userId));
    }

    [Authorize(Roles = "Admin,Driver")]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        return Ok(await orderService.UpdateStatusAsync(id, request.Status));
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim is not null && Guid.TryParse(claim, out var id) ? id : null;
    }
}
