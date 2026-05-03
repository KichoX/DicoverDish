using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DiscoverDish.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Restaurants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<decimal>(type: "numeric", nullable: false),
                    Cuisines = table.Column<List<string>>(type: "text[]", nullable: false),
                    Tags = table.Column<List<string>>(type: "text[]", nullable: false),
                    IsOpen = table.Column<bool>(type: "boolean", nullable: false),
                    Hours = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Website = table.Column<string>(type: "text", nullable: true),
                    Instagram = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Restaurants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MenuItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MenuItems_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Section = table.Column<string>(type: "text", nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    Shape = table.Column<string>(type: "text", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tables_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    TableNumber = table.Column<string>(type: "text", nullable: true),
                    DeliveryAddress = table.Column<string>(type: "text", nullable: true),
                    GuestName = table.Column<string>(type: "text", nullable: false),
                    GuestPhone = table.Column<string>(type: "text", nullable: false),
                    OrderNotes = table.Column<string>(type: "text", nullable: true),
                    Subtotal = table.Column<decimal>(type: "numeric", nullable: false),
                    DeliveryFee = table.Column<decimal>(type: "numeric", nullable: false),
                    Total = table.Column<decimal>(type: "numeric", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TableId = table.Column<Guid>(type: "uuid", nullable: true),
                    GuestName = table.Column<string>(type: "text", nullable: false),
                    GuestPhone = table.Column<string>(type: "text", nullable: false),
                    GuestEmail = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Guests = table.Column<int>(type: "integer", nullable: false),
                    Occasion = table.Column<string>(type: "text", nullable: true),
                    SpecialRequests = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reservations_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reservations_Tables_TableId",
                        column: x => x.TableId,
                        principalTable: "Tables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Reservations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuItemName = table.Column<string>(type: "text", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_MenuItems_MenuItemId",
                        column: x => x.MenuItemId,
                        principalTable: "MenuItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Restaurants",
                columns: new[] { "Id", "Address", "CreatedAt", "Cuisines", "Description", "Hours", "ImageUrl", "Instagram", "IsOpen", "Name", "Phone", "Rating", "Slug", "Tags", "UpdatedAt", "Website" },
                values: new object[,]
                {
                    { new Guid("a0000000-0000-0000-0000-000000000001"), "Claren's St., 123/9", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "Italian" }, "An elegant Italian restaurant with a cozy atmosphere and authentic recipes.", "9:00AM - 8:00PM", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop", null, true, "Le Loup Imperial", null, 5.0m, "le-loup-imperial", new List<string> { "Pet-friendly" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0000000-0000-0000-0000-000000000002"), "Claren's St., 128", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "French" }, "A French bistro offering exquisite vegetarian options.", "10:00AM - 11:00PM", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop", null, false, "The Island", null, 3.6m, "the-island", new List<string> { "Vegetarian" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0000000-0000-0000-0000-000000000003"), "Oak Avenue, 45", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "Japanese" }, "Authentic Japanese cuisine with fresh sushi and traditional dishes.", "11:00AM - 10:00PM", "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop", null, true, "Sakura Garden", null, 4.8m, "sakura-garden", new List<string> { "Sushi", "Omakase" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0000000-0000-0000-0000-000000000004"), "Main Street, 78", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "Italian" }, "Traditional Neapolitan pizza made with imported ingredients.", "12:00PM - 11:00PM", "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop", null, true, "Bella Napoli", null, 4.5m, "bella-napoli", new List<string> { "Family-friendly", "Pizza" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0000000-0000-0000-0000-000000000005"), "Lange Reihe 93, Hamburg", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "Chinese" }, "Award-winning vegan Asian cuisine with creative plant-based dishes.", "11:00AM - 10:00PM", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop", null, true, "Bodhi Vegan Living", null, 9.5m, "bodhi-vegan-living", new List<string> { "Vegan", "Vegetarian" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0000000-0000-0000-0000-000000000006"), "Grosse Elbstrasse 143", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "German" }, "Premium seafood restaurant overlooking the Elbe river.", "11:30AM - 11:00PM", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop", null, true, "Fischereihafen Restaurant", null, 4.7m, "fischereihafen-restaurant", new List<string> { "Seafood" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0000000-0000-0000-0000-000000000007"), "Schulterblatt 73", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "Italian" }, "Cozy Italian trattoria serving homemade pasta and regional wines.", "5:00PM - 10:30PM", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop", null, false, "Trattoria da Enzo", null, 4.4m, "trattoria-da-enzo", new List<string> { "Pet-friendly" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0000000-0000-0000-0000-000000000008"), "Steindamm 54", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "Chinese" }, "Authentic Cantonese and Sichuan cuisine with dim sum brunch.", "11:00AM - 11:30PM", "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop", null, true, "Golden Dragon", null, 4.2m, "golden-dragon", new List<string> { "Family-friendly" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0000000-0000-0000-0000-000000000009"), "Birkbuschstraße 7, 12165 Berlin-Steglitz", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new List<string> { "Italian", "Pizza" }, "Authentic Italian restaurant in the heart of Berlin-Steglitz, celebrated for stone-oven pizzas baked to perfection and handmade pasta. A warm Mediterranean atmosphere with over 20 years of tradition.", "12:00PM - 12:00AM", "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&h=600&fit=crop", "https://www.instagram.com/ristorantematera", true, "Ristorante Matera", "+493060927677", 4.7m, "ristorante-matera", new List<string> { "Wood-fired oven", "Outdoor seating", "Delivery" }, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "https://www.restaurant-matera.de" }
                });

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "Price", "RestaurantId", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("c0000000-0000-0000-0000-000000000001"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Grilled bread rubbed with garlic, topped with tomatoes, basil, and olive oil", "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=200&h=150&fit=crop", true, "Bruschetta Classica", 8.5m, new Guid("a0000000-0000-0000-0000-000000000001"), 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000002"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Fresh mozzarella, tomatoes, and basil drizzled with balsamic glaze", "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=200&h=150&fit=crop", true, "Caprese Salad", 12.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000003"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ask your server for today's selection", null, true, "Soup of the Day", 7.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000004"), "Main Courses", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic Roman pasta with eggs, pecorino cheese, guanciale, and black pepper", "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200&h=150&fit=crop", true, "Spaghetti Carbonara", 18.5m, new Guid("a0000000-0000-0000-0000-000000000001"), 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000005"), "Main Courses", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Creamy arborio rice with wild mushrooms and parmesan", "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=200&h=150&fit=crop", true, "Risotto ai Funghi", 22.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000006"), "Main Courses", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Braised veal shanks with vegetables, white wine, and gremolata", null, false, "Osso Buco", 32.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000007"), "Main Courses", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Fresh sea bass with lemon, capers, and roasted vegetables", "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=200&h=150&fit=crop", true, "Grilled Sea Bass", 28.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000008"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "San Marzano tomatoes, fresh mozzarella, basil, olive oil", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=150&fit=crop", true, "Margherita", 14.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 8, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000009"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mozzarella, gorgonzola, fontina, and parmigiano", null, true, "Quattro Formaggi", 18.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 9, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000010"), "Desserts", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=150&fit=crop", true, "Tiramisu", 9.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000011"), "Desserts", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Silky vanilla cream with berry compote", null, true, "Panna Cotta", 8.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 11, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000012"), "Drinks", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Double shot of Italian espresso", null, true, "Espresso", 3.5m, new Guid("a0000000-0000-0000-0000-000000000001"), 12, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000013"), "Drinks", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Glass of red or white house wine", null, true, "House Wine", 8.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 13, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0000000-0000-0000-0000-000000000014"), "Drinks", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sparkling mineral water (500ml)", null, true, "San Pellegrino", 4.0m, new Guid("a0000000-0000-0000-0000-000000000001"), 14, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000001"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mixed Italian cold cuts, marinated olives, grilled peppers and sun-dried tomatoes", "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop", true, "Antipasto Misto", 12.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000002"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Fresh mozzarella slices layered with vine tomatoes and fragrant basil", "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop", true, "Caprese con Mozzarella", 12.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000003"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Thinly sliced roasted veal with a creamy tuna sauce, capers and fresh parsley", "https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=400&h=300&fit=crop", true, "Vitello Tonnato", 13.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000004"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Beef tenderloin carpaccio with lemon vinaigrette, fresh champignons, rocket and shaved Parmigiano", "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop", true, "Carpaccio di Manzo", 14.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000005"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delicate San Daniele Parma ham draped over ripe, sweet cantaloupe melon", "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop", true, "Prosciutto e Melone", 12.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000006"), "Starters", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2× toasted sourdough with fresh tomatoes and basil · 2× with tuna and red onion", "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop", true, "Bruschetta (4 pcs)", 6.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000007"), "Salads", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Seasonal mixed leaves with house vinaigrette", "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", true, "Insalata Mista", 6.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000008"), "Salads", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Rocket salad with cherry tomatoes and shaved Parmigiano", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", true, "Insalata di Rucola", 11.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 8, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000009"), "Salads", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mixed seasonal salad topped with premium tuna, olives and red onion", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", true, "Insalata di Tonno", 11.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 9, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000010"), "Salads", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mixed salad with grilled chicken breast strips, cherry tomatoes and light cream dressing", "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=400&h=300&fit=crop", true, "Insalata di Pollo", 12.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000011"), "Salads", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mixed salad with Parma ham, soft-boiled egg, cherry tomatoes — the signature salad", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", true, "Insalata Matera", 13.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 11, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000012"), "Soups", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Velvety cream of tomato soup with fresh basil oil", "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", true, "Zuppa di Pomodoro", 6.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 12, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000013"), "Soups", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Hearty fresh vegetable soup with seasonal produce, cannellini beans and a Parmigiano rind", "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop", true, "Minestrone", 6.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 13, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000014"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Stone-oven baked flatbread with fresh rosemary, coarse sea salt and extra virgin olive oil", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop", true, "Focaccia", 6.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 14, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000015"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "San Marzano tomato, fior di latte mozzarella and fresh basil — stone-oven baked", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", true, "Margherita", 9.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 15, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000016"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tomato sauce, mozzarella and Italian salami, stone-oven baked to a perfectly crisp crust", "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop", true, "Salame", 11.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 16, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000017"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tomato sauce, mozzarella and a seasonal medley of fresh market vegetables", "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop", true, "Vegetale", 12.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 17, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000018"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tomato sauce, mozzarella and fiery spicy Italian salami from Calabria", "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop", true, "Calabrese", 13.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 18, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000019"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tomato sauce, mozzarella, premium tuna and sweet red onion", "https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&h=300&fit=crop", true, "Tonno e Cipolla", 12.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 19, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000020"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tomato sauce, mozzarella, San Daniele Parma ham, fresh rocket and shaved Parmigiano — our signature pizza", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", true, "Matera", 14.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 20, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000021"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tomato sauce, mozzarella and whole king prawns, finished with garlic and flat-leaf parsley", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", true, "Scampi", 15.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 21, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000022"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Creamy Gorgonzola, baby spinach and toasted walnuts", "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop", true, "Spinaci", 13.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 22, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000023"), "Pizza", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "The works: salami, cooked ham, mushrooms and peperoni on tomato and mozzarella", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", true, "Pizza Mista", 14.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 23, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000024"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Spaghetti tossed in golden garlic-infused extra virgin olive oil with fresh chilli and parsley", "https://images.unsplash.com/photo-1473093226555-0b4e15c91b01?w=400&h=300&fit=crop", true, "Spaghetti Aglio e Olio", 11.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 24, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000025"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Penne in a fiery tomato and chilli sauce with olives", "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop", true, "Penne all'Arrabbiata", 12.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 25, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000026"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic Roman pasta with pancetta, egg yolks, cream and Parmigiano-Reggiano", "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop", true, "Spaghetti Carbonara", 13.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 26, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000027"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Spaghetti with San Marzano tomato fillets, garlic and fresh basil", "https://images.unsplash.com/photo-1551183053-bf91798d3e5e?w=400&h=300&fit=crop", true, "Spaghetti Napoli", 11.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 27, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000028"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Slow-cooked minced beef ragù in a rich San Marzano tomato sauce", "https://images.unsplash.com/photo-1551183053-bf91798d3e5e?w=400&h=300&fit=crop", true, "Spaghetti Bolognese", 13.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 28, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000029"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Pillowy potato gnocchi tossed in fragrant browned sage butter and Parmigiano", "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", true, "Gnocchi e Burro alla Salvia", 12.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 29, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000030"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Egg tagliatelle with diced Atlantic salmon in a silky lobster cream sauce", "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop", true, "Tagliatelle al Salmone", 14.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 30, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000031"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Penne with a colourful sauté of fresh seasonal market vegetables", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", true, "Penne Vegetale", 13.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 31, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000032"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Penne with tender chicken breast strips and champignons in a light cream and white wine sauce", "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", true, "Penne con Pollo", 13.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 32, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000033"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Chef's tagliatelle with beef tenderloin tips, courgette, fresh tomatoes and basil", "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&h=300&fit=crop", true, "Tagliatelle dello Chef", 15.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 33, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000034"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Homemade baked lasagne with slow-cooked Bolognese ragù, béchamel and Parmigiano", "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop", true, "Lasagne al Forno", 14.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 34, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000035"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Egg tagliatelle coated in a vibrant Genovese pesto", "https://images.unsplash.com/photo-1473093226555-0b4e15c91b01?w=400&h=300&fit=crop", true, "Tagliatelle Pesto", 12.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 35, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000036"), "Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Penne with a creamy Gorgonzola sauce and wilted baby spinach", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", true, "Penne Gorgonzola e Spinaci", 13.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 36, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000037"), "Handmade Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "House-made ravioli filled with ricotta and spinach in a light San Marzano tomato sauce", "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", true, "Ravioli Ricotta e Spinaci", 16.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 37, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000038"), "Handmade Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "House-made green ravioli stuffed with minced beef and leek in a light meat ragù", "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", true, "Ravioli Verde al Manzo", 17.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 38, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000039"), "Handmade Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "House-made ravioli filled with chestnut purée in a classic sage brown butter sauce", "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", true, "Ravioli alle Castagne", 17.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 39, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000040"), "Handmade Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "House-made ravioli filled with wild porcini mushrooms in a rich porcini cream sauce", "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", true, "Ravioli ai Funghi Porcini", 17.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 40, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000041"), "Handmade Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "House-made squid-ink black ravioli filled with fresh fish in a delicate lobster bisque sauce", "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop", true, "Ravioli Neri al Pesce", 18.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 41, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000042"), "Handmade Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "House-made squid-ink black linguine with crab meat and courgette in a light tomato sauce", "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop", true, "Linguine Nere ai Granchi", 17.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 42, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000043"), "Handmade Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "House-made cannelloni filled with ricotta and spinach, oven-baked under béchamel and tomato", "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop", true, "Cannelloni Ricotta e Spinaci", 16.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 43, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000044"), "Handmade Pasta", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "A generous mixed selection of all house-made ravioli varieties — the perfect sharing feast for two", "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", true, "Ravioli Misto (for 2)", 38.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 44, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000045"), "Meat", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Pork fillet medallions with seasonal wild mushrooms in a light cream and white wine sauce", "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", true, "Medaglioni alla Boscaiola", 22.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 45, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000046"), "Meat", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Premium grilled beef tenderloin with seasonal vegetables and your choice of sauce", "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=300&fit=crop", true, "Filetto di Manzo", 29.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 46, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000047"), "Meat", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Beef tenderloin in a fragrant green peppercorn and cognac cream sauce", "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=300&fit=crop", true, "Filetto di Manzo al Pepe Verde", 31.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 47, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000048"), "Meat", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Pork fillet medallions wrapped in Parma ham and fresh sage, pan-cooked in white wine", "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", true, "Saltimbocca alla Romana", 22.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 48, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000049"), "Meat", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Grilled rump steak topped with a bold, creamy Gorgonzola sauce", "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", true, "Bistecca alla Gorgonzola", 25.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 49, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000050"), "Meat", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Rump steak in a velvety green peppercorn cream sauce, served with seasonal vegetables", "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", true, "Bistecca al Pepe Verde", 26.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 50, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000051"), "Fish", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "5 king prawns grilled on hot lava stone, with lemon, garlic and fresh herbs", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", true, "Scampi alla Griglia", 25.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 51, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000052"), "Fish", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "5 king prawns in the house lobster cream sauce — the seafood signature of Ristorante Matera", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", true, "Scampi del Matera", 27.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 52, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000053"), "Fish", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Pan-seared pike-perch fillet with a Pommery wholegrain mustard sauce and seasonal vegetables", "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop", true, "Zanderfilet", 23.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 53, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000054"), "Fish", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Atlantic salmon fillet poached in white wine with shallots, capers and fresh dill", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop", true, "Salmone al Vino Bianco", 24.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 54, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000055"), "Desserts", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Homemade — espresso-soaked Savoiardi, mascarpone cream and a generous dusting of dark cocoa", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop", true, "Tiramisù", 7.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 55, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000056"), "Desserts", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Silky vanilla cream set dessert with a coulis of puréed seasonal fruits", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop", true, "Panna Cotta", 7.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 56, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000057"), "Desserts", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic Italian truffle ice cream with an Amaretto di Saronno heart, dusted in dark cocoa", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop", true, "Tartufo Amaretto", 7.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 57, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000058"), "Desserts", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Three generous scoops of mixed artisan Italian ice cream", "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop", true, "Gelato Misto", 6.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 58, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000059"), "Desserts", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "The house dessert plate — Tiramisù, Panna Cotta, Tartufo and seasonal fruit", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop", true, "Dessert Misto Matera", 11.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 59, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000060"), "Desserts", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic baked custard with a golden caramel mirror", "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop", true, "Crème Caramel", 8.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 60, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000061"), "Drinks", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Glass of Chianti Classico DOCG — rich Sangiovese with cherry, leather and earthy notes", "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop", true, "Chianti Classico", 6.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 61, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000062"), "Drinks", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Chilled glass of Italian Prosecco Superiore — fine persistent bubbles, notes of apple and white peach", "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=300&fit=crop", true, "Prosecco DOC", 5.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 62, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000063"), "Drinks", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Double ristretto from our Italian arabica blend", "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop", true, "Espresso", 2.50m, new Guid("a0000000-0000-0000-0000-000000000009"), 63, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d0000000-0000-0000-0000-000000000064"), "Drinks", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Still or sparkling Italian mineral water, 500ml bottle", "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop", true, "Acqua Minerale", 3.00m, new Guid("a0000000-0000-0000-0000-000000000009"), 64, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Tables",
                columns: new[] { "Id", "Capacity", "IsAvailable", "Number", "RestaurantId", "Section", "Shape" },
                values: new object[,]
                {
                    { new Guid("b0000000-0000-0000-0000-000000000001"), 2, true, 1, new Guid("a0000000-0000-0000-0000-000000000009"), "Garden", "Round" },
                    { new Guid("b0000000-0000-0000-0000-000000000002"), 4, true, 2, new Guid("a0000000-0000-0000-0000-000000000009"), "Garden", "Rectangular" },
                    { new Guid("b0000000-0000-0000-0000-000000000003"), 6, false, 3, new Guid("a0000000-0000-0000-0000-000000000009"), "Garden", "Rectangular" },
                    { new Guid("b0000000-0000-0000-0000-000000000004"), 2, true, 1, new Guid("a0000000-0000-0000-0000-000000000009"), "Fountain", "Round" },
                    { new Guid("b0000000-0000-0000-0000-000000000005"), 4, true, 2, new Guid("a0000000-0000-0000-0000-000000000009"), "Fountain", "Rectangular" },
                    { new Guid("b0000000-0000-0000-0000-000000000006"), 4, true, 3, new Guid("a0000000-0000-0000-0000-000000000009"), "Fountain", "Square" },
                    { new Guid("b0000000-0000-0000-0000-000000000007"), 2, true, 4, new Guid("a0000000-0000-0000-0000-000000000009"), "Fountain", "Round" },
                    { new Guid("b0000000-0000-0000-0000-000000000008"), 6, true, 5, new Guid("a0000000-0000-0000-0000-000000000009"), "Fountain", "Rectangular" },
                    { new Guid("b0000000-0000-0000-0000-000000000009"), 2, false, 6, new Guid("a0000000-0000-0000-0000-000000000009"), "Fountain", "Round" },
                    { new Guid("b0000000-0000-0000-0000-000000000010"), 8, true, 1, new Guid("a0000000-0000-0000-0000-000000000009"), "1st Floor", "Rectangular" },
                    { new Guid("b0000000-0000-0000-0000-000000000011"), 4, true, 2, new Guid("a0000000-0000-0000-0000-000000000009"), "1st Floor", "Round" },
                    { new Guid("b0000000-0000-0000-0000-000000000012"), 6, true, 3, new Guid("a0000000-0000-0000-0000-000000000009"), "1st Floor", "Rectangular" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_RestaurantId",
                table: "MenuItems",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_MenuItemId",
                table: "OrderItems",
                column: "MenuItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RestaurantId",
                table: "Orders",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_RestaurantId",
                table: "Reservations",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_TableId",
                table: "Reservations",
                column: "TableId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_UserId",
                table: "Reservations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_Slug",
                table: "Restaurants",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tables_RestaurantId",
                table: "Tables",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "Reservations");

            migrationBuilder.DropTable(
                name: "MenuItems");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Tables");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Restaurants");
        }
    }
}
