using DiscoverDish.Api.DTOs.Order;

namespace DiscoverDish.Api.Services;

public interface IOrderService
{
    Task<OrderDto> CreateAsync(CreateOrderRequest request, Guid? userId);
    Task<OrderDto> GetByIdAsync(Guid id);
    Task<List<OrderDto>> GetByRestaurantAsync(Guid restaurantId, string? status);
    Task<List<OrderDto>> GetByUserAsync(Guid userId);
    Task<OrderDto> UpdateStatusAsync(Guid id, string status);
}
