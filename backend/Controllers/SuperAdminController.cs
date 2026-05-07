using System.Security.Claims;
using DiscoverDish.Api.Data;
using DiscoverDish.Api.DTOs.SuperAdmin;
using DiscoverDish.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscoverDish.Api.Controllers;

[ApiController]
[Route("api/super-admin")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminController(AppDbContext db, IConfiguration config) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<PlatformStats>> GetStats()
    {
        var totalUsers        = await db.Users.CountAsync(u => u.Role != UserRole.SuperAdmin);
        var totalRestaurants  = await db.Restaurants.CountAsync();
        var totalOrders       = await db.Orders.CountAsync();
        var totalReservations = await db.Reservations.CountAsync();
        var totalRevenue      = await db.Orders.SumAsync(o => (decimal?)o.Total) ?? 0m;

        var since = DateTime.UtcNow.AddDays(-13).Date;
        var dailyOrders = await db.Orders
            .Where(o => o.CreatedAt >= since)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count(), Revenue = g.Sum(o => o.Total) })
            .OrderBy(g => g.Date)
            .ToListAsync();

        // Fill gaps for last 14 days
        var last14 = Enumerable.Range(0, 14)
            .Select(i => DateTime.UtcNow.AddDays(-13 + i).Date)
            .Select(d =>
            {
                var found = dailyOrders.FirstOrDefault(x => x.Date == d);
                return new DailyStat(d.ToString("MMM d"), found?.Count ?? 0, found?.Revenue ?? 0m);
            });

        var topRestaurants = await db.Restaurants
            .Select(r => new
            {
                r.Id, r.Name,
                Orders  = r.Orders.Count,
                Revenue = r.Orders.Sum(o => (decimal?)o.Total) ?? 0m
            })
            .OrderByDescending(r => r.Orders)
            .Take(5)
            .ToListAsync();

        return Ok(new PlatformStats(
            totalUsers, totalRestaurants, totalOrders, totalReservations, totalRevenue,
            last14,
            topRestaurants.Select(r => new RestaurantStat(r.Id.ToString(), r.Name, r.Orders, r.Revenue))
        ));
    }

    [HttpGet("accounts")]
    public async Task<ActionResult<IEnumerable<RestaurantAccountDto>>> GetAccounts()
    {
        var admins = await db.Users
            .Where(u => u.Role == UserRole.Admin && u.RestaurantId != null)
            .ToListAsync();

        var restaurantIds = admins.Select(u => u.RestaurantId!.Value).ToList();

        var restaurants = await db.Restaurants
            .Where(r => restaurantIds.Contains(r.Id))
            .Select(r => new
            {
                r.Id, r.Name, r.Slug, r.ImageUrl, r.Address, r.Phone, r.IsOpen,
                TotalOrders  = r.Orders.Count,
                TotalRevenue = r.Orders.Sum(o => (decimal?)o.Total) ?? 0m,
            })
            .ToDictionaryAsync(r => r.Id);

        var result = admins.Select(u =>
        {
            var r = u.RestaurantId.HasValue && restaurants.TryGetValue(u.RestaurantId.Value, out var rest) ? rest : null;
            return new RestaurantAccountDto(
                u.Id, u.Name, u.Email,
                r?.Id ?? Guid.Empty, r?.Name ?? "—", r?.Slug ?? "—",
                u.CreatedAt,
                r?.TotalOrders ?? 0, r?.TotalRevenue ?? 0m,
                r?.ImageUrl, r?.Address, r?.Phone, r?.IsOpen ?? false
            );
        });

        return Ok(result);
    }

    [HttpPost("accounts")]
    public async Task<ActionResult<RestaurantAccountDto>> CreateAccount([FromBody] CreateRestaurantAccountRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email.ToLower()))
            return Conflict(new { message = "Email already in use." });

        var slug = req.RestaurantName.ToLower()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace(".", "")
            .Replace(",", "");

        // Ensure slug uniqueness
        var baseSlug = slug;
        var n = 1;
        while (await db.Restaurants.AnyAsync(r => r.Slug == slug))
            slug = $"{baseSlug}-{n++}";

        var restaurant = new Restaurant
        {
            Name        = req.RestaurantName,
            Slug        = slug,
            ImageUrl    = req.ImageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
            Rating      = 0m,
            Cuisines    = [],
            Tags        = [],
            IsOpen      = false,
            Hours       = "12:00PM - 10:00PM",
            Address     = req.Address ?? "",
            Description = "",
            Phone       = req.Phone,
        };
        db.Restaurants.Add(restaurant);

        var user = new User
        {
            Name         = req.AdminName,
            Email        = req.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role         = UserRole.Admin,
            RestaurantId = restaurant.Id,
        };
        db.Users.Add(user);

        await db.SaveChangesAsync();

        return Ok(new RestaurantAccountDto(
            user.Id, user.Name, user.Email,
            restaurant.Id, restaurant.Name, restaurant.Slug,
            user.CreatedAt,
            TotalOrders: 0, TotalRevenue: 0m,
            restaurant.ImageUrl, restaurant.Address, restaurant.Phone, restaurant.IsOpen
        ));
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await db.Users
            .Where(u => u.Role != UserRole.SuperAdmin)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new { u.Id, u.Name, u.Email, Role = u.Role.ToString(), u.CreatedAt, u.RestaurantId })
            .ToListAsync();
        return Ok(users);
    }
}
