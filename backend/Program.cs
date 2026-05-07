using System.Text;
using DiscoverDish.Api.Data;
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
}

// ── Middleware Pipeline ───────────────────────────────────────────
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

    if (!await db.Users.AnyAsync(u => u.Email == "marco@restaurant-matera.de"))
    {
        db.Users.Add(new DiscoverDish.Api.Entities.User
        {
            Id = new Guid("e0000000-0000-0000-0000-000000000002"),
            Name = "Marco Rossi",
            Email = "marco@restaurant-matera.de",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Matera2026!"),
            Role = DiscoverDish.Api.Entities.UserRole.Admin,
            RestaurantId = mateId,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
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
