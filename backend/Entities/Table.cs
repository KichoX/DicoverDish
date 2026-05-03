namespace DiscoverDish.Api.Entities;

public enum TableShape { Round, Rectangular, Square }

public class Table
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RestaurantId { get; set; }
    public int Number { get; set; }
    public string Section { get; set; } = null!;
    public int Capacity { get; set; }
    public TableShape Shape { get; set; }
    public bool IsAvailable { get; set; } = true;

    // Navigation
    public Restaurant Restaurant { get; set; } = null!;
    public ICollection<Reservation> Reservations { get; set; } = [];
}
