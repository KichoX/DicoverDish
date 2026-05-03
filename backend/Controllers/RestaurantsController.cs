using DiscoverDish.Api.DTOs.MenuItem;
using DiscoverDish.Api.DTOs.Restaurant;
using DiscoverDish.Api.DTOs.Table;
using DiscoverDish.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscoverDish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController(IRestaurantService restaurantService) : ControllerBase
{
    // ── Restaurants ──────────────────────────────────────────────────

    [HttpGet]
    public async Task<ActionResult<List<RestaurantListDto>>> GetAll(
        [FromQuery] string? cuisine,
        [FromQuery] string? search,
        [FromQuery] bool? isOpen)
    {
        return Ok(await restaurantService.GetAllAsync(cuisine, search, isOpen));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<RestaurantDto>> GetBySlug(string slug)
    {
        return Ok(await restaurantService.GetBySlugAsync(slug));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<RestaurantDto>> Create([FromBody] CreateRestaurantRequest request)
    {
        var result = await restaurantService.CreateAsync(request);
        return CreatedAtAction(nameof(GetBySlug), new { slug = result.Slug }, result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RestaurantDto>> Update(Guid id, [FromBody] UpdateRestaurantRequest request)
    {
        return Ok(await restaurantService.UpdateAsync(id, request));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await restaurantService.DeleteAsync(id);
        return NoContent();
    }

    // ── Menu Items ───────────────────────────────────────────────────

    [HttpGet("{id:guid}/menu")]
    public async Task<ActionResult<List<MenuItemDto>>> GetMenu(Guid id)
    {
        return Ok(await restaurantService.GetMenuAsync(id));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id:guid}/menu")]
    public async Task<ActionResult<MenuItemDto>> AddMenuItem(Guid id, [FromBody] CreateMenuItemRequest request)
    {
        var result = await restaurantService.AddMenuItemAsync(id, request);
        return Created($"api/restaurants/{id}/menu/{result.Id}", result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}/menu/{itemId:guid}")]
    public async Task<ActionResult<MenuItemDto>> UpdateMenuItem(Guid id, Guid itemId, [FromBody] UpdateMenuItemRequest request)
    {
        return Ok(await restaurantService.UpdateMenuItemAsync(id, itemId, request));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}/menu/{itemId:guid}")]
    public async Task<IActionResult> DeleteMenuItem(Guid id, Guid itemId)
    {
        await restaurantService.DeleteMenuItemAsync(id, itemId);
        return NoContent();
    }

    // ── Tables ───────────────────────────────────────────────────────

    [HttpGet("{id:guid}/tables")]
    public async Task<ActionResult<List<TableDto>>> GetTables(Guid id)
    {
        return Ok(await restaurantService.GetTablesAsync(id));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id:guid}/tables")]
    public async Task<ActionResult<TableDto>> AddTable(Guid id, [FromBody] CreateTableRequest request)
    {
        var result = await restaurantService.AddTableAsync(id, request);
        return Created($"api/restaurants/{id}/tables/{result.Id}", result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}/tables/{tableId:guid}")]
    public async Task<ActionResult<TableDto>> UpdateTable(Guid id, Guid tableId, [FromBody] CreateTableRequest request)
    {
        return Ok(await restaurantService.UpdateTableAsync(id, tableId, request));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}/tables/{tableId:guid}")]
    public async Task<IActionResult> DeleteTable(Guid id, Guid tableId)
    {
        await restaurantService.DeleteTableAsync(id, tableId);
        return NoContent();
    }
}
