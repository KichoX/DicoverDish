using System.Security.Claims;
using DiscoverDish.Api.DTOs.Reservation;
using DiscoverDish.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscoverDish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController(IReservationService reservationService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationRequest request)
    {
        var userId = GetUserId();
        var result = await reservationService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReservationDto>> GetById(Guid id)
    {
        var reservation = await reservationService.GetByIdAsync(id);
        var userId = GetUserId();
        if (reservation.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();
        return Ok(reservation);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("restaurant/{restaurantId:guid}")]
    public async Task<ActionResult<List<ReservationDto>>> GetByRestaurant(
        Guid restaurantId,
        [FromQuery] string? status,
        [FromQuery] string? date)
    {
        DateOnly? dateFilter = date is not null && DateOnly.TryParse(date, out var d) ? d : null;
        return Ok(await reservationService.GetByRestaurantAsync(restaurantId, status, dateFilter));
    }

    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<List<ReservationDto>>> GetMy()
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        return Ok(await reservationService.GetByUserAsync(userId));
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ReservationDto>> UpdateStatus(Guid id, [FromBody] UpdateReservationStatusRequest request)
    {
        return Ok(await reservationService.UpdateStatusAsync(id, request.Status));
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var reservation = await reservationService.GetByIdAsync(id);
        var userId = GetUserId();
        if (reservation.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();
        await reservationService.DeleteAsync(id);
        return NoContent();
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim is not null && Guid.TryParse(claim, out var id) ? id : null;
    }
}
