namespace DiscoverDish.Api.DTOs.Restaurant;

public record RestaurantDto(
    Guid Id,
    string Name,
    string Slug,
    string ImageUrl,
    decimal Rating,
    List<string> Cuisines,
    List<string> Tags,
    bool IsOpen,
    string Hours,
    string Address,
    string? Description,
    string? Phone,
    string? Website,
    string? Instagram,
    DateTime CreatedAt
);

public record RestaurantListDto(
    Guid Id,
    string Name,
    string Slug,
    string ImageUrl,
    decimal Rating,
    List<string> Cuisines,
    List<string> Tags,
    bool IsOpen,
    string Hours,
    string Address
);
