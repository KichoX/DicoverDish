using DiscoverDish.Api.Data;
using DiscoverDish.Api.DTOs.Order;
using DiscoverDish.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DiscoverDish.Api.Services;

public class OrderService(AppDbContext db) : IOrderService
{
    public async Task<OrderDto> CreateAsync(CreateOrderRequest req, Guid? userId)
    {
        var restaurant = await db.Restaurants.FindAsync(req.RestaurantId)
            ?? throw new KeyNotFoundException($"Restaurant {req.RestaurantId} not found.");

        if (!Enum.TryParse<OrderType>(req.Type, ignoreCase: true, out var orderType))
            throw new ArgumentException($"Invalid order type '{req.Type}'.");

        if (orderType == OrderType.Delivery && string.IsNullOrWhiteSpace(req.DeliveryAddress))
            throw new ArgumentException("Delivery address is required for delivery orders.");

        var menuItemIds = req.Items.Select(i => i.MenuItemId).ToList();
        var menuItems = await db.MenuItems
            .Where(m => menuItemIds.Contains(m.Id) && m.RestaurantId == req.RestaurantId)
            .ToDictionaryAsync(m => m.Id);

        if (menuItems.Count != menuItemIds.Distinct().Count())
            throw new ArgumentException("One or more menu items are invalid or unavailable.");

        var items = req.Items.Select(i =>
        {
            var mi = menuItems[i.MenuItemId];
            return new OrderItem
            {
                MenuItemId = mi.Id,
                MenuItemName = mi.Name,
                UnitPrice = mi.Price,
                Quantity = i.Quantity,
                Notes = i.Notes
            };
        }).ToList();

        decimal subtotal = items.Sum(i => i.UnitPrice * i.Quantity);
        decimal deliveryFee = orderType == OrderType.Delivery ? 3.99m : 0m;

        var order = new Order
        {
            RestaurantId = req.RestaurantId,
            UserId = userId,
            Type = orderType,
            TableNumber = req.TableNumber,
            DeliveryAddress = req.DeliveryAddress,
            GuestName = req.GuestName,
            GuestPhone = req.GuestPhone,
            OrderNotes = req.OrderNotes,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            Total = subtotal + deliveryFee,
            Items = items
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        return Map(order, restaurant.Name);
    }

    public async Task<OrderDto> GetByIdAsync(Guid id)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new KeyNotFoundException($"Order {id} not found.");

        return Map(order, order.Restaurant.Name);
    }

    public async Task<List<OrderDto>> GetByRestaurantAsync(Guid restaurantId, string? status)
    {
        var query = db.Orders
            .Include(o => o.Items)
            .Include(o => o.Restaurant)
            .Where(o => o.RestaurantId == restaurantId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var s))
            query = query.Where(o => o.Status == s);

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => Map(o, o.Restaurant.Name))
            .ToListAsync();
    }

    public async Task<List<OrderDto>> GetByUserAsync(Guid userId)
    {
        return await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Restaurant)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => Map(o, o.Restaurant.Name))
            .ToListAsync();
    }

    public async Task<OrderDto> UpdateStatusAsync(Guid id, string status)
    {
        if (!Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var s))
            throw new ArgumentException($"Invalid status '{status}'.");

        var order = await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new KeyNotFoundException($"Order {id} not found.");

        order.Status = s;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Map(order, order.Restaurant.Name);
    }

    private static OrderDto Map(Order o, string restaurantName) => new(
        o.Id, o.RestaurantId, restaurantName, o.UserId,
        o.Type.ToString(), o.TableNumber, o.DeliveryAddress,
        o.GuestName, o.GuestPhone, o.OrderNotes,
        o.Subtotal, o.DeliveryFee, o.Total,
        o.Status.ToString(),
        o.Items.Select(i => new OrderItemDto(
            i.Id, i.MenuItemId, i.MenuItemName, i.UnitPrice, i.Quantity, i.Notes
        )).ToList(),
        o.CreatedAt);
}
