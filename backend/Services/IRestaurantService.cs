using DiscoverDish.Api.DTOs.MenuItem;
using DiscoverDish.Api.DTOs.Restaurant;
using DiscoverDish.Api.DTOs.Table;

namespace DiscoverDish.Api.Services;

public interface IRestaurantService
{
    Task<List<RestaurantListDto>> GetAllAsync(string? cuisine, string? search, bool? isOpen);
    Task<RestaurantDto> GetBySlugAsync(string slug);
    Task<RestaurantDto> GetByIdAsync(Guid id);
    Task<RestaurantDto> CreateAsync(CreateRestaurantRequest request);
    Task<RestaurantDto> UpdateAsync(Guid id, UpdateRestaurantRequest request);
    Task DeleteAsync(Guid id);

    Task<List<MenuItemDto>> GetMenuAsync(Guid restaurantId);
    Task<MenuItemDto> AddMenuItemAsync(Guid restaurantId, CreateMenuItemRequest request);
    Task<MenuItemDto> UpdateMenuItemAsync(Guid restaurantId, Guid itemId, UpdateMenuItemRequest request);
    Task DeleteMenuItemAsync(Guid restaurantId, Guid itemId);

    Task<List<TableDto>> GetTablesAsync(Guid restaurantId);
    Task<TableDto> AddTableAsync(Guid restaurantId, CreateTableRequest request);
    Task<TableDto> UpdateTableAsync(Guid restaurantId, Guid tableId, CreateTableRequest request);
    Task DeleteTableAsync(Guid restaurantId, Guid tableId);
}
