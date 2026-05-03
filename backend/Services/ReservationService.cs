using DiscoverDish.Api.Data;
using DiscoverDish.Api.DTOs.Reservation;
using DiscoverDish.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DiscoverDish.Api.Services;

public class ReservationService(AppDbContext db) : IReservationService
{
    public async Task<ReservationDto> CreateAsync(CreateReservationRequest req, Guid? userId)
    {
        var restaurant = await db.Restaurants.FindAsync(req.RestaurantId)
            ?? throw new KeyNotFoundException($"Restaurant {req.RestaurantId} not found.");

        if (!DateOnly.TryParse(req.Date, out var date))
            throw new ArgumentException($"Invalid date format '{req.Date}'. Use YYYY-MM-DD.");

        if (!TimeOnly.TryParse(req.Time, out var time))
            throw new ArgumentException($"Invalid time format '{req.Time}'. Use HH:mm.");

        var reservation = new Reservation
        {
            RestaurantId = req.RestaurantId,
            UserId = userId,
            GuestName = req.GuestName,
            GuestPhone = req.GuestPhone,
            GuestEmail = req.GuestEmail,
            Date = date,
            Time = time,
            Guests = req.Guests,
            Occasion = req.Occasion,
            SpecialRequests = req.SpecialRequests,
            Status = ReservationStatus.Confirmed
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        return Map(reservation, restaurant.Name);
    }

    public async Task<ReservationDto> GetByIdAsync(Guid id)
    {
        var r = await db.Reservations
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException($"Reservation {id} not found.");

        return Map(r, r.Restaurant.Name);
    }

    public async Task<List<ReservationDto>> GetByRestaurantAsync(Guid restaurantId, string? status, DateOnly? date)
    {
        var query = db.Reservations
            .Include(r => r.Restaurant)
            .Where(r => r.RestaurantId == restaurantId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReservationStatus>(status, ignoreCase: true, out var s))
            query = query.Where(r => r.Status == s);

        if (date.HasValue)
            query = query.Where(r => r.Date == date.Value);

        return await query
            .OrderBy(r => r.Date).ThenBy(r => r.Time)
            .Select(r => Map(r, r.Restaurant.Name))
            .ToListAsync();
    }

    public async Task<List<ReservationDto>> GetByUserAsync(Guid userId)
    {
        return await db.Reservations
            .Include(r => r.Restaurant)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.Date).ThenByDescending(r => r.Time)
            .Select(r => Map(r, r.Restaurant.Name))
            .ToListAsync();
    }

    public async Task<ReservationDto> UpdateStatusAsync(Guid id, string status)
    {
        if (!Enum.TryParse<ReservationStatus>(status, ignoreCase: true, out var s))
            throw new ArgumentException($"Invalid status '{status}'.");

        var r = await db.Reservations
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException($"Reservation {id} not found.");

        r.Status = s;
        r.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Map(r, r.Restaurant.Name);
    }

    public async Task DeleteAsync(Guid id)
    {
        var r = await db.Reservations.FindAsync(id)
            ?? throw new KeyNotFoundException($"Reservation {id} not found.");
        db.Reservations.Remove(r);
        await db.SaveChangesAsync();
    }

    private static ReservationDto Map(Reservation r, string restaurantName) => new(
        r.Id, r.RestaurantId, restaurantName, r.UserId, r.TableId,
        r.GuestName, r.GuestPhone, r.GuestEmail,
        r.Date.ToString("yyyy-MM-dd"),
        r.Time.ToString("HH:mm"),
        r.Guests, r.Occasion, r.SpecialRequests,
        r.Status.ToString(), r.CreatedAt);
}
