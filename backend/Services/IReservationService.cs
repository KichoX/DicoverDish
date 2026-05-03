using DiscoverDish.Api.DTOs.Reservation;

namespace DiscoverDish.Api.Services;

public interface IReservationService
{
    Task<ReservationDto> CreateAsync(CreateReservationRequest request, Guid? userId);
    Task<ReservationDto> GetByIdAsync(Guid id);
    Task<List<ReservationDto>> GetByRestaurantAsync(Guid restaurantId, string? status, DateOnly? date);
    Task<List<ReservationDto>> GetByUserAsync(Guid userId);
    Task<ReservationDto> UpdateStatusAsync(Guid id, string status);
    Task DeleteAsync(Guid id);
}
