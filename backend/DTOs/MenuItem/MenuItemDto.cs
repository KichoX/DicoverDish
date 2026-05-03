namespace DiscoverDish.Api.DTOs.MenuItem;

public record MenuItemDto(
    Guid Id,
    Guid RestaurantId,
    string Name,
    string Description,
    decimal Price,
    string? ImageUrl,
    string Category,
    bool IsAvailable,
    int SortOrder
);

public record CreateMenuItemRequest(
    string Name,
    string Description,
    decimal Price,
    string? ImageUrl,
    string Category,
    bool IsAvailable,
    int SortOrder
);

public record UpdateMenuItemRequest(
    string? Name,
    string? Description,
    decimal? Price,
    string? ImageUrl,
    string? Category,
    bool? IsAvailable,
    int? SortOrder
);
