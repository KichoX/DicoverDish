namespace DiscoverDish.Api.DTOs.Restaurant;

public record CreateRestaurantRequest(
    string Name,
    string ImageUrl,
    List<string> Cuisines,
    List<string> Tags,
    bool IsOpen,
    string Hours,
    string Address,
    string? Description,
    string? Phone,
    string? Website,
    string? Instagram
);

public record UpdateRestaurantRequest(
    string? Name,
    string? ImageUrl,
    List<string>? Cuisines,
    List<string>? Tags,
    bool? IsOpen,
    string? Hours,
    string? Address,
    string? Description,
    string? Phone,
    string? Website,
    string? Instagram
);
