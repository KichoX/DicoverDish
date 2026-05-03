namespace DiscoverDish.Api.Entities;

public enum OrderType { Delivery, Pickup, DineIn }
public enum OrderStatus { New, Preparing, Ready, Delivered, Cancelled }

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RestaurantId { get; set; }
    public Guid? UserId { get; set; }
    public OrderType Type { get; set; }
    public string? TableNumber { get; set; }
    public string? DeliveryAddress { get; set; }
    public string GuestName { get; set; } = null!;
    public string GuestPhone { get; set; } = null!;
    public string? OrderNotes { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal Total { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Restaurant Restaurant { get; set; } = null!;
    public User? User { get; set; }
    public ICollection<OrderItem> Items { get; set; } = [];
}
