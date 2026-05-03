namespace DiscoverDish.Api.Entities;

public enum ReservationStatus { Pending, Confirmed, Cancelled }

public class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RestaurantId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? TableId { get; set; }
    public string GuestName { get; set; } = null!;
    public string GuestPhone { get; set; } = null!;
    public string? GuestEmail { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; }
    public int Guests { get; set; }
    public string? Occasion { get; set; }
    public string? SpecialRequests { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Confirmed;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Restaurant Restaurant { get; set; } = null!;
    public User? User { get; set; }
    public Table? Table { get; set; }
}
