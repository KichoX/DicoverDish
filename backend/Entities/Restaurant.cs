namespace DiscoverDish.Api.Entities;

public class Restaurant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public decimal Rating { get; set; }
    public List<string> Cuisines { get; set; } = [];
    public List<string> Tags { get; set; } = [];
    public bool IsOpen { get; set; }
    public string Hours { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string? Description { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Instagram { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<MenuItem> MenuItems { get; set; } = [];
    public ICollection<Table> Tables { get; set; } = [];
    public ICollection<Reservation> Reservations { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
}
