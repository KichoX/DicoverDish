namespace DiscoverDish.Api.DTOs.Table;

public record TableDto(
    Guid Id,
    Guid RestaurantId,
    int Number,
    string Section,
    int Capacity,
    string Shape,
    bool IsAvailable
);

public record CreateTableRequest(
    int Number,
    string Section,
    int Capacity,
    string Shape,
    bool IsAvailable
);
