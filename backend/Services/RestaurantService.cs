using DiscoverDish.Api.Data;
using DiscoverDish.Api.DTOs.MenuItem;
using DiscoverDish.Api.DTOs.Restaurant;
using DiscoverDish.Api.DTOs.Table;
using DiscoverDish.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DiscoverDish.Api.Services;

public class RestaurantService(AppDbContext db) : IRestaurantService
{
    // ── Restaurants ──────────────────────────────────────────────────

    public async Task<List<RestaurantListDto>> GetAllAsync(string? cuisine, string? search, bool? isOpen)
    {
        var query = db.Restaurants.AsQueryable();

        if (!string.IsNullOrWhiteSpace(cuisine))
            query = query.Where(r => r.Cuisines.Contains(cuisine));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(r =>
                r.Name.ToLower().Contains(term) ||
                r.Address.ToLower().Contains(term) ||
                (r.Description != null && r.Description.ToLower().Contains(term)));
        }

        if (isOpen.HasValue)
            query = query.Where(r => r.IsOpen == isOpen.Value);

        return await query
            .OrderBy(r => r.Name)
            .Select(r => new RestaurantListDto(
                r.Id, r.Name, r.Slug, r.ImageUrl, r.Rating,
                r.Cuisines, r.Tags, r.IsOpen, r.Hours, r.Address))
            .ToListAsync();
    }

    public async Task<RestaurantDto> GetBySlugAsync(string slug)
    {
        var r = await db.Restaurants.FirstOrDefaultAsync(r => r.Slug == slug)
            ?? throw new KeyNotFoundException($"Restaurant '{slug}' not found.");
        return Map(r);
    }

    public async Task<RestaurantDto> GetByIdAsync(Guid id)
    {
        var r = await db.Restaurants.FindAsync(id)
            ?? throw new KeyNotFoundException($"Restaurant {id} not found.");
        return Map(r);
    }

    public async Task<RestaurantDto> CreateAsync(CreateRestaurantRequest req)
    {
        var r = new Restaurant
        {
            Name = req.Name,
            Slug = GenerateSlug(req.Name),
            ImageUrl = req.ImageUrl,
            Cuisines = req.Cuisines,
            Tags = req.Tags,
            IsOpen = req.IsOpen,
            Hours = req.Hours,
            Address = req.Address,
            Description = req.Description,
            Phone = req.Phone,
            Website = req.Website,
            Instagram = req.Instagram
        };
        db.Restaurants.Add(r);
        await db.SaveChangesAsync();
        return Map(r);
    }

    public async Task<RestaurantDto> UpdateAsync(Guid id, UpdateRestaurantRequest req)
    {
        var r = await db.Restaurants.FindAsync(id)
            ?? throw new KeyNotFoundException($"Restaurant {id} not found.");

        if (req.Name is not null) { r.Name = req.Name; r.Slug = GenerateSlug(req.Name); }
        if (req.ImageUrl is not null) r.ImageUrl = req.ImageUrl;
        if (req.Cuisines is not null) r.Cuisines = req.Cuisines;
        if (req.Tags is not null) r.Tags = req.Tags;
        if (req.IsOpen.HasValue) r.IsOpen = req.IsOpen.Value;
        if (req.Hours is not null) r.Hours = req.Hours;
        if (req.Address is not null) r.Address = req.Address;
        if (req.Description is not null) r.Description = req.Description;
        if (req.Phone is not null) r.Phone = req.Phone;
        if (req.Website is not null) r.Website = req.Website;
        if (req.Instagram is not null) r.Instagram = req.Instagram;

        r.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Map(r);
    }

    public async Task DeleteAsync(Guid id)
    {
        var r = await db.Restaurants.FindAsync(id)
            ?? throw new KeyNotFoundException($"Restaurant {id} not found.");
        db.Restaurants.Remove(r);
        await db.SaveChangesAsync();
    }

    // ── Menu Items ───────────────────────────────────────────────────

    public async Task<List<MenuItemDto>> GetMenuAsync(Guid restaurantId)
    {
        return await db.MenuItems
            .Where(m => m.RestaurantId == restaurantId)
            .OrderBy(m => m.SortOrder).ThenBy(m => m.Name)
            .Select(m => MapMenuItem(m))
            .ToListAsync();
    }

    public async Task<MenuItemDto> AddMenuItemAsync(Guid restaurantId, CreateMenuItemRequest req)
    {
        if (!await db.Restaurants.AnyAsync(r => r.Id == restaurantId))
            throw new KeyNotFoundException($"Restaurant {restaurantId} not found.");

        var item = new MenuItem
        {
            RestaurantId = restaurantId,
            Name = req.Name,
            Description = req.Description,
            Price = req.Price,
            ImageUrl = req.ImageUrl,
            Category = req.Category,
            IsAvailable = req.IsAvailable,
            SortOrder = req.SortOrder
        };
        db.MenuItems.Add(item);
        await db.SaveChangesAsync();
        return MapMenuItem(item);
    }

    public async Task<MenuItemDto> UpdateMenuItemAsync(Guid restaurantId, Guid itemId, UpdateMenuItemRequest req)
    {
        var item = await db.MenuItems.FirstOrDefaultAsync(m => m.Id == itemId && m.RestaurantId == restaurantId)
            ?? throw new KeyNotFoundException($"Menu item {itemId} not found.");

        if (req.Name is not null) item.Name = req.Name;
        if (req.Description is not null) item.Description = req.Description;
        if (req.Price.HasValue) item.Price = req.Price.Value;
        if (req.ImageUrl is not null) item.ImageUrl = req.ImageUrl;
        if (req.Category is not null) item.Category = req.Category;
        if (req.IsAvailable.HasValue) item.IsAvailable = req.IsAvailable.Value;
        if (req.SortOrder.HasValue) item.SortOrder = req.SortOrder.Value;

        item.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapMenuItem(item);
    }

    public async Task DeleteMenuItemAsync(Guid restaurantId, Guid itemId)
    {
        var item = await db.MenuItems.FirstOrDefaultAsync(m => m.Id == itemId && m.RestaurantId == restaurantId)
            ?? throw new KeyNotFoundException($"Menu item {itemId} not found.");
        db.MenuItems.Remove(item);
        await db.SaveChangesAsync();
    }

    // ── Tables ───────────────────────────────────────────────────────

    public async Task<List<TableDto>> GetTablesAsync(Guid restaurantId)
    {
        return await db.Tables
            .Where(t => t.RestaurantId == restaurantId)
            .OrderBy(t => t.Section).ThenBy(t => t.Number)
            .Select(t => MapTable(t))
            .ToListAsync();
    }

    public async Task<TableDto> AddTableAsync(Guid restaurantId, CreateTableRequest req)
    {
        if (!await db.Restaurants.AnyAsync(r => r.Id == restaurantId))
            throw new KeyNotFoundException($"Restaurant {restaurantId} not found.");

        if (!Enum.TryParse<TableShape>(req.Shape, ignoreCase: true, out var shape))
            throw new ArgumentException($"Invalid table shape '{req.Shape}'.");

        var table = new Table
        {
            RestaurantId = restaurantId,
            Number = req.Number,
            Section = req.Section,
            Capacity = req.Capacity,
            Shape = shape,
            IsAvailable = req.IsAvailable
        };
        db.Tables.Add(table);
        await db.SaveChangesAsync();
        return MapTable(table);
    }

    public async Task<TableDto> UpdateTableAsync(Guid restaurantId, Guid tableId, CreateTableRequest req)
    {
        var table = await db.Tables.FirstOrDefaultAsync(t => t.Id == tableId && t.RestaurantId == restaurantId)
            ?? throw new KeyNotFoundException($"Table {tableId} not found.");

        if (!Enum.TryParse<TableShape>(req.Shape, ignoreCase: true, out var shape))
            throw new ArgumentException($"Invalid table shape '{req.Shape}'.");

        table.Number = req.Number;
        table.Section = req.Section;
        table.Capacity = req.Capacity;
        table.Shape = shape;
        table.IsAvailable = req.IsAvailable;
        await db.SaveChangesAsync();
        return MapTable(table);
    }

    public async Task DeleteTableAsync(Guid restaurantId, Guid tableId)
    {
        var table = await db.Tables.FirstOrDefaultAsync(t => t.Id == tableId && t.RestaurantId == restaurantId)
            ?? throw new KeyNotFoundException($"Table {tableId} not found.");
        db.Tables.Remove(table);
        await db.SaveChangesAsync();
    }

    // ── Mappers ──────────────────────────────────────────────────────

    private static RestaurantDto Map(Restaurant r) => new(
        r.Id, r.Name, r.Slug, r.ImageUrl, r.Rating,
        r.Cuisines, r.Tags, r.IsOpen, r.Hours, r.Address,
        r.Description, r.Phone, r.Website, r.Instagram, r.CreatedAt);

    private static MenuItemDto MapMenuItem(MenuItem m) => new(
        m.Id, m.RestaurantId, m.Name, m.Description, m.Price,
        m.ImageUrl, m.Category, m.IsAvailable, m.SortOrder);

    private static TableDto MapTable(Table t) => new(
        t.Id, t.RestaurantId, t.Number, t.Section, t.Capacity,
        t.Shape.ToString(), t.IsAvailable);

    private static string GenerateSlug(string name) =>
        System.Text.RegularExpressions.Regex.Replace(name.ToLower(), @"[^a-z0-9]+", "-").Trim('-');
}
