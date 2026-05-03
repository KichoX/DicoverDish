namespace DiscoverDish.Api.DTOs.Reservation;

public record ReservationDto(
    Guid Id,
    Guid RestaurantId,
    string RestaurantName,
    Guid? UserId,
    Guid? TableId,
    string GuestName,
    string GuestPhone,
    string? GuestEmail,
    string Date,
    string Time,
    int Guests,
    string? Occasion,
    string? SpecialRequests,
    string Status,
    DateTime CreatedAt
);

public record CreateReservationRequest(
    Guid RestaurantId,
    string GuestName,
    string GuestPhone,
    string? GuestEmail,
    string Date,
    string Time,
    int Guests,
    string? Occasion,
    string? SpecialRequests
);

public record UpdateReservationStatusRequest(string Status);
