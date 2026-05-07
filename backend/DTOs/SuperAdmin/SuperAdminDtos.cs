namespace DiscoverDish.Api.DTOs.SuperAdmin;

public record PlatformStats(
    int TotalUsers,
    int TotalRestaurants,
    int TotalOrders,
    int TotalReservations,
    decimal TotalRevenue,
    IEnumerable<DailyStat> OrdersLast14Days,
    IEnumerable<RestaurantStat> TopRestaurants
);

public record DailyStat(string Date, int Count, decimal Revenue);
public record RestaurantStat(string Id, string Name, int Orders, decimal Revenue);

public record RestaurantAccountDto(
    Guid UserId,
    string AdminName,
    string Email,
    Guid RestaurantId,
    string RestaurantName,
    string RestaurantSlug,
    DateTime CreatedAt,
    int TotalOrders,
    decimal TotalRevenue,
    string? ImageUrl,
    string? Address,
    string? Phone,
    bool IsOpen
);

public record CreateRestaurantAccountRequest(
    string RestaurantName,
    string AdminName,
    string Email,
    string Password,
    string? ImageUrl,
    string? Address,
    string? Phone
);
