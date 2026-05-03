namespace DiscoverDish.Api.DTOs.Order;

public record OrderItemDto(
    Guid Id,
    Guid MenuItemId,
    string MenuItemName,
    decimal UnitPrice,
    int Quantity,
    string? Notes
);

public record OrderDto(
    Guid Id,
    Guid RestaurantId,
    string RestaurantName,
    Guid? UserId,
    string Type,
    string? TableNumber,
    string? DeliveryAddress,
    string GuestName,
    string GuestPhone,
    string? OrderNotes,
    decimal Subtotal,
    decimal DeliveryFee,
    decimal Total,
    string Status,
    List<OrderItemDto> Items,
    DateTime CreatedAt
);

public record CreateOrderItemRequest(
    Guid MenuItemId,
    int Quantity,
    string? Notes
);

public record CreateOrderRequest(
    Guid RestaurantId,
    string Type,
    string? TableNumber,
    string? DeliveryAddress,
    string GuestName,
    string GuestPhone,
    string? OrderNotes,
    List<CreateOrderItemRequest> Items
);

public record UpdateOrderStatusRequest(string Status);
