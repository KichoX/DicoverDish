using System.Text;
using DiscoverDish.Api.Data;
using DiscoverDish.Api.Entities;
using DiscoverDish.Api.Middleware;
using DiscoverDish.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.EnableRetryOnFailure(maxRetryCount: 5)));

// ── JWT Auth ──────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://discoverdish.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ── Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRestaurantService, RestaurantService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IReservationService, ReservationService>();

// ── Controllers + JSON ────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ── Swagger ───────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DiscoverDish API",
        Version = "v1",
        Description = "Restaurant discovery and ordering platform"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddHealthChecks();

var app = builder.Build();

// ── Migrate & Seed ────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await SeedUsersAsync(db);
    await SeedDataFixesAsync(db);
    await SeedOrdersAndReservationsAsync(db);
}

// ── Middleware Pipeline ───────────────────────────────────────────
app.UseStaticFiles();
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DiscoverDish API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

static async Task SeedUsersAsync(DiscoverDish.Api.Data.AppDbContext db)
{
    var mateId = new Guid("a0000000-0000-0000-0000-000000000009");

    if (!await db.Users.AnyAsync(u => u.Email == "admin@discoverdish.com"))
    {
        db.Users.Add(new DiscoverDish.Api.Entities.User
        {
            Id = new Guid("e0000000-0000-0000-0000-000000000001"),
            Name = "Super Admin",
            Email = "admin@discoverdish.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("SuperAdmin2026!"),
            Role = DiscoverDish.Api.Entities.UserRole.SuperAdmin,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        });
    }

    // Migrate old Marco account → Kimi, or create fresh if neither exists
    var oldMarco = await db.Users.FirstOrDefaultAsync(u => u.Email == "marco@restaurant-matera.de");
    var kimi     = await db.Users.FirstOrDefaultAsync(u => u.Email == "kimi@matera.de");

    if (oldMarco != null && kimi == null)
    {
        oldMarco.Name         = "Kimi";
        oldMarco.Email        = "kimi@matera.de";
        oldMarco.PasswordHash = BCrypt.Net.BCrypt.HashPassword("matera2026");
        oldMarco.UpdatedAt    = DateTime.UtcNow;
    }
    else if (oldMarco == null && kimi == null)
    {
        db.Users.Add(new DiscoverDish.Api.Entities.User
        {
            Id            = new Guid("e0000000-0000-0000-0000-000000000002"),
            Name          = "Kimi",
            Email         = "kimi@matera.de",
            PasswordHash  = BCrypt.Net.BCrypt.HashPassword("matera2026"),
            Role          = DiscoverDish.Api.Entities.UserRole.Admin,
            RestaurantId  = mateId,
            CreatedAt     = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt     = DateTime.UtcNow,
        });
    }

    if (!await db.Users.AnyAsync(u => u.Email == "laura@example.com"))
    {
        db.Users.Add(new DiscoverDish.Api.Entities.User
        {
            Id = new Guid("e0000000-0000-0000-0000-000000000003"),
            Name = "Laura Martinez",
            Email = "laura@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Client2026!"),
            Role = DiscoverDish.Api.Entities.UserRole.Client,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        });
    }

    await db.SaveChangesAsync();
}

app.Run();

static async Task SeedDataFixesAsync(AppDbContext db)
{
    // Fix address seeded before city rename
    var bodhi = await db.Restaurants.FirstOrDefaultAsync(r => r.Name == "Bodhi Vegan Living");
    if (bodhi != null && bodhi.Address == "Lange Reihe 93, Hamburg")
    {
        bodhi.Address = "Lange Reihe 93, Berlin";
        await db.SaveChangesAsync();
    }
}

static async Task SeedOrdersAndReservationsAsync(AppDbContext db)
{
    var mateId  = new Guid("a0000000-0000-0000-0000-000000000009");
    var lauraId = new Guid("e0000000-0000-0000-0000-000000000003");

    // Menu item IDs from AppDbContext HasData (d-series)
    var miId = (int i) => new Guid($"d0000000-0000-0000-0000-{i:D12}");
    var margherita = miId(15);  // €9.00
    var matPizza   = miId(20);  // €14.50  Matera pizza
    var carbonara  = miId(26);  // €13.00
    var tiramisu   = miId(55);  // €7.00
    var espresso   = miId(63);  // €2.50
    var chianti    = miId(61);  // €6.50
    var acqua      = miId(64);  // €3.00
    var antipasto  = miId(1);   // €12.50
    var salame     = miId(16);  // €11.00

    if (!await db.Orders.AnyAsync(o => o.RestaurantId == mateId))
    {
        var now = DateTime.UtcNow;

        db.Orders.Add(new Order
        {
            RestaurantId = mateId, UserId = lauraId,
            Type = OrderType.DineIn, TableNumber = "4",
            GuestName = "Laura Martinez", GuestPhone = "+49176123456",
            Status = OrderStatus.New,
            Subtotal = 30.00m, DeliveryFee = 0m, Total = 30.00m,
            CreatedAt = now.AddMinutes(-5), UpdatedAt = now.AddMinutes(-5),
            Items =
            [
                new OrderItem { MenuItemId = margherita, MenuItemName = "Margherita",      UnitPrice = 9.00m,  Quantity = 1 },
                new OrderItem { MenuItemId = matPizza,   MenuItemName = "Matera",           UnitPrice = 14.50m, Quantity = 1 },
                new OrderItem { MenuItemId = chianti,    MenuItemName = "Chianti Classico", UnitPrice = 6.50m,  Quantity = 1 },
            ]
        });

        db.Orders.Add(new Order
        {
            RestaurantId = mateId,
            Type = OrderType.DineIn, TableNumber = "7",
            GuestName = "Thomas Müller", GuestPhone = "+49160987654",
            Status = OrderStatus.Preparing,
            Subtotal = 35.50m, DeliveryFee = 0m, Total = 35.50m,
            CreatedAt = now.AddMinutes(-22), UpdatedAt = now.AddMinutes(-10),
            Items =
            [
                new OrderItem { MenuItemId = antipasto, MenuItemName = "Antipasto Misto",      UnitPrice = 12.50m, Quantity = 1 },
                new OrderItem { MenuItemId = carbonara, MenuItemName = "Spaghetti Carbonara",  UnitPrice = 13.00m, Quantity = 1 },
                new OrderItem { MenuItemId = tiramisu,  MenuItemName = "Tiramisù",             UnitPrice = 7.00m,  Quantity = 1 },
                new OrderItem { MenuItemId = acqua,     MenuItemName = "Acqua Minerale",       UnitPrice = 3.00m,  Quantity = 1 },
            ]
        });

        db.Orders.Add(new Order
        {
            RestaurantId = mateId,
            Type = OrderType.Pickup,
            GuestName = "Anna Schmidt", GuestPhone = "+49157112233",
            Status = OrderStatus.Ready,
            Subtotal = 27.50m, DeliveryFee = 0m, Total = 27.50m,
            CreatedAt = now.AddMinutes(-45), UpdatedAt = now.AddMinutes(-5),
            Items =
            [
                new OrderItem { MenuItemId = matPizza,   MenuItemName = "Matera",              UnitPrice = 14.50m, Quantity = 1 },
                new OrderItem { MenuItemId = carbonara,  MenuItemName = "Spaghetti Carbonara", UnitPrice = 13.00m, Quantity = 1 },
            ]
        });

        db.Orders.Add(new Order
        {
            RestaurantId = mateId, UserId = lauraId,
            Type = OrderType.DineIn, TableNumber = "2",
            GuestName = "Laura Martinez", GuestPhone = "+49176123456",
            Status = OrderStatus.Delivered,
            Subtotal = 29.50m, DeliveryFee = 0m, Total = 29.50m,
            CreatedAt = now.AddHours(-2), UpdatedAt = now.AddHours(-1),
            Items =
            [
                new OrderItem { MenuItemId = margherita, MenuItemName = "Margherita", UnitPrice = 9.00m,  Quantity = 1 },
                new OrderItem { MenuItemId = salame,     MenuItemName = "Salame",     UnitPrice = 11.00m, Quantity = 1 },
                new OrderItem { MenuItemId = tiramisu,   MenuItemName = "Tiramisù",   UnitPrice = 7.00m,  Quantity = 1 },
                new OrderItem { MenuItemId = espresso,   MenuItemName = "Espresso",   UnitPrice = 2.50m,  Quantity = 1 },
            ]
        });

        db.Orders.Add(new Order
        {
            RestaurantId = mateId,
            Type = OrderType.Delivery,
            DeliveryAddress = "Unter den Linden 5, 10117 Berlin",
            GuestName = "Marco Ferri", GuestPhone = "+49162445566",
            Status = OrderStatus.Delivered,
            Subtotal = 42.00m, DeliveryFee = 3.99m, Total = 45.99m,
            CreatedAt = now.AddDays(-1), UpdatedAt = now.AddDays(-1).AddHours(1),
            Items =
            [
                new OrderItem { MenuItemId = matPizza,   MenuItemName = "Matera",              UnitPrice = 14.50m, Quantity = 2 },
                new OrderItem { MenuItemId = carbonara,  MenuItemName = "Spaghetti Carbonara", UnitPrice = 13.00m, Quantity = 1 },
            ]
        });

        db.Orders.Add(new Order
        {
            RestaurantId = mateId,
            Type = OrderType.Pickup,
            GuestName = "Felix Braun", GuestPhone = "+49151778899",
            Status = OrderStatus.Cancelled,
            Subtotal = 16.00m, DeliveryFee = 0m, Total = 16.00m,
            CreatedAt = now.AddHours(-3), UpdatedAt = now.AddHours(-3).AddMinutes(10),
            Items =
            [
                new OrderItem { MenuItemId = margherita, MenuItemName = "Margherita", UnitPrice = 9.00m, Quantity = 1 },
                new OrderItem { MenuItemId = tiramisu,   MenuItemName = "Tiramisù",   UnitPrice = 7.00m, Quantity = 1 },
            ]
        });

        await db.SaveChangesAsync();
    }

    if (!await db.Reservations.AnyAsync(r => r.RestaurantId == mateId))
    {
        var now   = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        db.Reservations.AddRange(
            new Reservation
            {
                RestaurantId = mateId, UserId = lauraId,
                GuestName = "Laura Martinez", GuestPhone = "+49176123456", GuestEmail = "laura@example.com",
                Date = today, Time = new TimeOnly(19, 30), Guests = 2,
                Occasion = "Anniversary", Status = ReservationStatus.Confirmed,
                CreatedAt = now.AddDays(-2), UpdatedAt = now.AddDays(-2),
            },
            new Reservation
            {
                RestaurantId = mateId,
                GuestName = "Thomas Müller", GuestPhone = "+49160987654",
                Date = today, Time = new TimeOnly(20, 00), Guests = 4,
                Status = ReservationStatus.Confirmed,
                CreatedAt = now.AddDays(-1), UpdatedAt = now.AddDays(-1),
            },
            new Reservation
            {
                RestaurantId = mateId,
                GuestName = "Anna Schmidt", GuestPhone = "+49157112233", GuestEmail = "anna@example.com",
                Date = today.AddDays(1), Time = new TimeOnly(19, 00), Guests = 3,
                SpecialRequests = "Window table preferred",
                Status = ReservationStatus.Confirmed,
                CreatedAt = now.AddHours(-5), UpdatedAt = now.AddHours(-5),
            },
            new Reservation
            {
                RestaurantId = mateId,
                GuestName = "Marco Ferri", GuestPhone = "+49162445566",
                Date = today.AddDays(2), Time = new TimeOnly(20, 30), Guests = 6,
                Occasion = "Birthday", SpecialRequests = "Birthday cake, please",
                Status = ReservationStatus.Pending,
                CreatedAt = now.AddHours(-2), UpdatedAt = now.AddHours(-2),
            },
            new Reservation
            {
                RestaurantId = mateId,
                GuestName = "Sophie Weber", GuestPhone = "+49170334455",
                Date = today.AddDays(1), Time = new TimeOnly(13, 00), Guests = 2,
                Status = ReservationStatus.Confirmed,
                CreatedAt = now.AddDays(-3), UpdatedAt = now.AddDays(-3),
            },
            new Reservation
            {
                RestaurantId = mateId,
                GuestName = "Jonas Klein", GuestPhone = "+49151223344",
                Date = today.AddDays(-1), Time = new TimeOnly(18, 30), Guests = 2,
                Status = ReservationStatus.Cancelled,
                CreatedAt = now.AddDays(-4), UpdatedAt = now.AddDays(-2),
            }
        );

        await db.SaveChangesAsync();
    }
}
