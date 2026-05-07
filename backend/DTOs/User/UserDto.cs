namespace DiscoverDish.Api.DTOs.User;

public record UserDto(Guid Id, string Name, string Email, string Role, DateTime CreatedAt, Guid? RestaurantId, string? RestaurantSlug);
public record UpdateUserRequest(string? Name, string? Email, string? CurrentPassword, string? NewPassword);
