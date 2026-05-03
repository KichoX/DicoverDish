using Microsoft.EntityFrameworkCore;
using DiscoverDish.Api.Entities;

namespace DiscoverDish.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(rt => rt.Token).IsUnique();
            e.HasOne(rt => rt.User)
             .WithMany(u => u.RefreshTokens)
             .HasForeignKey(rt => rt.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Restaurant>(e =>
        {
            e.HasIndex(r => r.Slug).IsUnique();
            e.Property(r => r.Cuisines).HasColumnType("text[]");
            e.Property(r => r.Tags).HasColumnType("text[]");
        });

        modelBuilder.Entity<MenuItem>(e =>
        {
            e.HasOne(m => m.Restaurant)
             .WithMany(r => r.MenuItems)
             .HasForeignKey(m => m.RestaurantId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Table>(e =>
        {
            e.Property(t => t.Shape).HasConversion<string>();
            e.HasOne(t => t.Restaurant)
             .WithMany(r => r.Tables)
             .HasForeignKey(t => t.RestaurantId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Reservation>(e =>
        {
            e.Property(r => r.Status).HasConversion<string>();
            e.HasOne(r => r.Restaurant)
             .WithMany(r => r.Reservations)
             .HasForeignKey(r => r.RestaurantId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.User)
             .WithMany(u => u.Reservations)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(r => r.Table)
             .WithMany(t => t.Reservations)
             .HasForeignKey(r => r.TableId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.Property(o => o.Type).HasConversion<string>();
            e.Property(o => o.Status).HasConversion<string>();
            e.HasOne(o => o.Restaurant)
             .WithMany(r => r.Orders)
             .HasForeignKey(o => o.RestaurantId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(o => o.User)
             .WithMany(u => u.Orders)
             .HasForeignKey(o => o.UserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasOne(oi => oi.Order)
             .WithMany(o => o.Items)
             .HasForeignKey(oi => oi.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(oi => oi.MenuItem)
             .WithMany(mi => mi.OrderItems)
             .HasForeignKey(oi => oi.MenuItemId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // ── Restaurant GUIDs ─────────────────────────────────────────
        var r1  = new Guid("a0000000-0000-0000-0000-000000000001");
        var r2  = new Guid("a0000000-0000-0000-0000-000000000002");
        var r3  = new Guid("a0000000-0000-0000-0000-000000000003");
        var r4  = new Guid("a0000000-0000-0000-0000-000000000004");
        var r5  = new Guid("a0000000-0000-0000-0000-000000000005");
        var r6  = new Guid("a0000000-0000-0000-0000-000000000006");
        var r7  = new Guid("a0000000-0000-0000-0000-000000000007");
        var r8  = new Guid("a0000000-0000-0000-0000-000000000008");
        var r9  = new Guid("a0000000-0000-0000-0000-000000000009");
        var now = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Restaurant>().HasData(
            new Restaurant
            {
                Id = r1, Name = "Le Loup Imperial", Slug = "le-loup-imperial",
                ImageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
                Rating = 5.0m, Cuisines = ["Italian"], Tags = ["Pet-friendly"],
                IsOpen = true, Hours = "9:00AM - 8:00PM", Address = "Claren's St., 123/9",
                Description = "An elegant Italian restaurant with a cozy atmosphere and authentic recipes.",
                CreatedAt = now, UpdatedAt = now
            },
            new Restaurant
            {
                Id = r2, Name = "The Island", Slug = "the-island",
                ImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
                Rating = 3.6m, Cuisines = ["French"], Tags = ["Vegetarian"],
                IsOpen = false, Hours = "10:00AM - 11:00PM", Address = "Claren's St., 128",
                Description = "A French bistro offering exquisite vegetarian options.",
                CreatedAt = now, UpdatedAt = now
            },
            new Restaurant
            {
                Id = r3, Name = "Sakura Garden", Slug = "sakura-garden",
                ImageUrl = "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop",
                Rating = 4.8m, Cuisines = ["Japanese"], Tags = ["Sushi", "Omakase"],
                IsOpen = true, Hours = "11:00AM - 10:00PM", Address = "Oak Avenue, 45",
                Description = "Authentic Japanese cuisine with fresh sushi and traditional dishes.",
                CreatedAt = now, UpdatedAt = now
            },
            new Restaurant
            {
                Id = r4, Name = "Bella Napoli", Slug = "bella-napoli",
                ImageUrl = "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop",
                Rating = 4.5m, Cuisines = ["Italian"], Tags = ["Family-friendly", "Pizza"],
                IsOpen = true, Hours = "12:00PM - 11:00PM", Address = "Main Street, 78",
                Description = "Traditional Neapolitan pizza made with imported ingredients.",
                CreatedAt = now, UpdatedAt = now
            },
            new Restaurant
            {
                Id = r5, Name = "Bodhi Vegan Living", Slug = "bodhi-vegan-living",
                ImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
                Rating = 9.5m, Cuisines = ["Chinese"], Tags = ["Vegan", "Vegetarian"],
                IsOpen = true, Hours = "11:00AM - 10:00PM", Address = "Lange Reihe 93, Hamburg",
                Description = "Award-winning vegan Asian cuisine with creative plant-based dishes.",
                CreatedAt = now, UpdatedAt = now
            },
            new Restaurant
            {
                Id = r6, Name = "Fischereihafen Restaurant", Slug = "fischereihafen-restaurant",
                ImageUrl = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
                Rating = 4.7m, Cuisines = ["German"], Tags = ["Seafood"],
                IsOpen = true, Hours = "11:30AM - 11:00PM", Address = "Grosse Elbstrasse 143",
                Description = "Premium seafood restaurant overlooking the Elbe river.",
                CreatedAt = now, UpdatedAt = now
            },
            new Restaurant
            {
                Id = r7, Name = "Trattoria da Enzo", Slug = "trattoria-da-enzo",
                ImageUrl = "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop",
                Rating = 4.4m, Cuisines = ["Italian"], Tags = ["Pet-friendly"],
                IsOpen = false, Hours = "5:00PM - 10:30PM", Address = "Schulterblatt 73",
                Description = "Cozy Italian trattoria serving homemade pasta and regional wines.",
                CreatedAt = now, UpdatedAt = now
            },
            new Restaurant
            {
                Id = r8, Name = "Golden Dragon", Slug = "golden-dragon",
                ImageUrl = "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop",
                Rating = 4.2m, Cuisines = ["Chinese"], Tags = ["Family-friendly"],
                IsOpen = true, Hours = "11:00AM - 11:30PM", Address = "Steindamm 54",
                Description = "Authentic Cantonese and Sichuan cuisine with dim sum brunch.",
                CreatedAt = now, UpdatedAt = now
            },
            new Restaurant
            {
                Id = r9, Name = "Ristorante Matera", Slug = "ristorante-matera",
                ImageUrl = "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&h=600&fit=crop",
                Rating = 4.7m, Cuisines = ["Italian", "Pizza"],
                Tags = ["Wood-fired oven", "Outdoor seating", "Delivery"],
                IsOpen = true, Hours = "12:00PM - 12:00AM",
                Address = "Birkbuschstraße 7, 12165 Berlin-Steglitz",
                Description = "Authentic Italian restaurant in the heart of Berlin-Steglitz, celebrated for stone-oven pizzas baked to perfection and handmade pasta. A warm Mediterranean atmosphere with over 20 years of tradition.",
                Phone = "+493060927677",
                Website = "https://www.restaurant-matera.de",
                Instagram = "https://www.instagram.com/ristorantematera",
                CreatedAt = now, UpdatedAt = now
            }
        );

        // ── Tables (all for Ristorante Matera) ──────────────────────
        var tableIds = Enumerable.Range(1, 12)
            .Select(i => new Guid($"b0000000-0000-0000-0000-{i:D12}"))
            .ToArray();

        modelBuilder.Entity<Table>().HasData(
            new Table { Id = tableIds[0],  RestaurantId = r9, Number = 1, Section = "Garden",    Capacity = 2, Shape = TableShape.Round,        IsAvailable = true  },
            new Table { Id = tableIds[1],  RestaurantId = r9, Number = 2, Section = "Garden",    Capacity = 4, Shape = TableShape.Rectangular,   IsAvailable = true  },
            new Table { Id = tableIds[2],  RestaurantId = r9, Number = 3, Section = "Garden",    Capacity = 6, Shape = TableShape.Rectangular,   IsAvailable = false },
            new Table { Id = tableIds[3],  RestaurantId = r9, Number = 1, Section = "Fountain",  Capacity = 2, Shape = TableShape.Round,        IsAvailable = true  },
            new Table { Id = tableIds[4],  RestaurantId = r9, Number = 2, Section = "Fountain",  Capacity = 4, Shape = TableShape.Rectangular,   IsAvailable = true  },
            new Table { Id = tableIds[5],  RestaurantId = r9, Number = 3, Section = "Fountain",  Capacity = 4, Shape = TableShape.Square,        IsAvailable = true  },
            new Table { Id = tableIds[6],  RestaurantId = r9, Number = 4, Section = "Fountain",  Capacity = 2, Shape = TableShape.Round,        IsAvailable = true  },
            new Table { Id = tableIds[7],  RestaurantId = r9, Number = 5, Section = "Fountain",  Capacity = 6, Shape = TableShape.Rectangular,   IsAvailable = true  },
            new Table { Id = tableIds[8],  RestaurantId = r9, Number = 6, Section = "Fountain",  Capacity = 2, Shape = TableShape.Round,        IsAvailable = false },
            new Table { Id = tableIds[9],  RestaurantId = r9, Number = 1, Section = "1st Floor", Capacity = 8, Shape = TableShape.Rectangular,   IsAvailable = true  },
            new Table { Id = tableIds[10], RestaurantId = r9, Number = 2, Section = "1st Floor", Capacity = 4, Shape = TableShape.Round,        IsAvailable = true  },
            new Table { Id = tableIds[11], RestaurantId = r9, Number = 3, Section = "1st Floor", Capacity = 6, Shape = TableShape.Rectangular,   IsAvailable = true  }
        );

        // ── Menu Items (generic set, assigned to Le Loup Imperial) ──
        var m = (int i) => new Guid($"c0000000-0000-0000-0000-{i:D12}");

        modelBuilder.Entity<MenuItem>().HasData(
            new MenuItem { Id = m(1),  RestaurantId = r1, Name = "Bruschetta Classica",   Category = "Starters",     Price = 8.5m,  IsAvailable = true,  SortOrder = 1,  ImageUrl = "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=200&h=150&fit=crop", Description = "Grilled bread rubbed with garlic, topped with tomatoes, basil, and olive oil", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(2),  RestaurantId = r1, Name = "Caprese Salad",          Category = "Starters",     Price = 12.0m, IsAvailable = true,  SortOrder = 2,  ImageUrl = "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=200&h=150&fit=crop", Description = "Fresh mozzarella, tomatoes, and basil drizzled with balsamic glaze", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(3),  RestaurantId = r1, Name = "Soup of the Day",        Category = "Starters",     Price = 7.0m,  IsAvailable = true,  SortOrder = 3,  Description = "Ask your server for today's selection", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(4),  RestaurantId = r1, Name = "Spaghetti Carbonara",    Category = "Main Courses", Price = 18.5m, IsAvailable = true,  SortOrder = 4,  ImageUrl = "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200&h=150&fit=crop", Description = "Classic Roman pasta with eggs, pecorino cheese, guanciale, and black pepper", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(5),  RestaurantId = r1, Name = "Risotto ai Funghi",      Category = "Main Courses", Price = 22.0m, IsAvailable = true,  SortOrder = 5,  ImageUrl = "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=200&h=150&fit=crop", Description = "Creamy arborio rice with wild mushrooms and parmesan", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(6),  RestaurantId = r1, Name = "Osso Buco",              Category = "Main Courses", Price = 32.0m, IsAvailable = false, SortOrder = 6,  Description = "Braised veal shanks with vegetables, white wine, and gremolata", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(7),  RestaurantId = r1, Name = "Grilled Sea Bass",       Category = "Main Courses", Price = 28.0m, IsAvailable = true,  SortOrder = 7,  ImageUrl = "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=200&h=150&fit=crop", Description = "Fresh sea bass with lemon, capers, and roasted vegetables", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(8),  RestaurantId = r1, Name = "Margherita",             Category = "Pizza",        Price = 14.0m, IsAvailable = true,  SortOrder = 8,  ImageUrl = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=150&fit=crop", Description = "San Marzano tomatoes, fresh mozzarella, basil, olive oil", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(9),  RestaurantId = r1, Name = "Quattro Formaggi",       Category = "Pizza",        Price = 18.0m, IsAvailable = true,  SortOrder = 9,  Description = "Mozzarella, gorgonzola, fontina, and parmigiano", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(10), RestaurantId = r1, Name = "Tiramisu",               Category = "Desserts",     Price = 9.0m,  IsAvailable = true,  SortOrder = 10, ImageUrl = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=150&fit=crop", Description = "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(11), RestaurantId = r1, Name = "Panna Cotta",            Category = "Desserts",     Price = 8.0m,  IsAvailable = true,  SortOrder = 11, Description = "Silky vanilla cream with berry compote", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(12), RestaurantId = r1, Name = "Espresso",              Category = "Drinks",       Price = 3.5m,  IsAvailable = true,  SortOrder = 12, Description = "Double shot of Italian espresso", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(13), RestaurantId = r1, Name = "House Wine",            Category = "Drinks",       Price = 8.0m,  IsAvailable = true,  SortOrder = 13, Description = "Glass of red or white house wine", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = m(14), RestaurantId = r1, Name = "San Pellegrino",        Category = "Drinks",       Price = 4.0m,  IsAvailable = true,  SortOrder = 14, Description = "Sparkling mineral water (500ml)", CreatedAt = now, UpdatedAt = now }
        );

        // ── Ristorante Matera full menu ──────────────────────────────
        var mr = (int i) => new Guid($"d0000000-0000-0000-0000-{i:D12}");

        modelBuilder.Entity<MenuItem>().HasData(
            // Starters
            new MenuItem { Id = mr(1),  RestaurantId = r9, Name = "Antipasto Misto",            Category = "Starters",       Price = 12.50m, IsAvailable = true, SortOrder = 1,  ImageUrl = "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop", Description = "Mixed Italian cold cuts, marinated olives, grilled peppers and sun-dried tomatoes", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(2),  RestaurantId = r9, Name = "Caprese con Mozzarella",     Category = "Starters",       Price = 12.50m, IsAvailable = true, SortOrder = 2,  ImageUrl = "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop", Description = "Fresh mozzarella slices layered with vine tomatoes and fragrant basil", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(3),  RestaurantId = r9, Name = "Vitello Tonnato",            Category = "Starters",       Price = 13.50m, IsAvailable = true, SortOrder = 3,  ImageUrl = "https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=400&h=300&fit=crop", Description = "Thinly sliced roasted veal with a creamy tuna sauce, capers and fresh parsley", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(4),  RestaurantId = r9, Name = "Carpaccio di Manzo",         Category = "Starters",       Price = 14.00m, IsAvailable = true, SortOrder = 4,  ImageUrl = "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop", Description = "Beef tenderloin carpaccio with lemon vinaigrette, fresh champignons, rocket and shaved Parmigiano", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(5),  RestaurantId = r9, Name = "Prosciutto e Melone",        Category = "Starters",       Price = 12.00m, IsAvailable = true, SortOrder = 5,  ImageUrl = "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop", Description = "Delicate San Daniele Parma ham draped over ripe, sweet cantaloupe melon", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(6),  RestaurantId = r9, Name = "Bruschetta (4 pcs)",         Category = "Starters",       Price = 6.50m,  IsAvailable = true, SortOrder = 6,  ImageUrl = "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop", Description = "2× toasted sourdough with fresh tomatoes and basil · 2× with tuna and red onion", CreatedAt = now, UpdatedAt = now },
            // Salads
            new MenuItem { Id = mr(7),  RestaurantId = r9, Name = "Insalata Mista",             Category = "Salads",         Price = 6.50m,  IsAvailable = true, SortOrder = 7,  ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", Description = "Seasonal mixed leaves with house vinaigrette", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(8),  RestaurantId = r9, Name = "Insalata di Rucola",         Category = "Salads",         Price = 11.50m, IsAvailable = true, SortOrder = 8,  ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", Description = "Rocket salad with cherry tomatoes and shaved Parmigiano", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(9),  RestaurantId = r9, Name = "Insalata di Tonno",          Category = "Salads",         Price = 11.50m, IsAvailable = true, SortOrder = 9,  ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", Description = "Mixed seasonal salad topped with premium tuna, olives and red onion", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(10), RestaurantId = r9, Name = "Insalata di Pollo",          Category = "Salads",         Price = 12.50m, IsAvailable = true, SortOrder = 10, ImageUrl = "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=400&h=300&fit=crop", Description = "Mixed salad with grilled chicken breast strips, cherry tomatoes and light cream dressing", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(11), RestaurantId = r9, Name = "Insalata Matera",            Category = "Salads",         Price = 13.50m, IsAvailable = true, SortOrder = 11, ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", Description = "Mixed salad with Parma ham, soft-boiled egg, cherry tomatoes — the signature salad", CreatedAt = now, UpdatedAt = now },
            // Soups
            new MenuItem { Id = mr(12), RestaurantId = r9, Name = "Zuppa di Pomodoro",          Category = "Soups",          Price = 6.50m,  IsAvailable = true, SortOrder = 12, ImageUrl = "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", Description = "Velvety cream of tomato soup with fresh basil oil", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(13), RestaurantId = r9, Name = "Minestrone",                 Category = "Soups",          Price = 6.50m,  IsAvailable = true, SortOrder = 13, ImageUrl = "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop", Description = "Hearty fresh vegetable soup with seasonal produce, cannellini beans and a Parmigiano rind", CreatedAt = now, UpdatedAt = now },
            // Pizza
            new MenuItem { Id = mr(14), RestaurantId = r9, Name = "Focaccia",                   Category = "Pizza",          Price = 6.50m,  IsAvailable = true, SortOrder = 14, ImageUrl = "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop", Description = "Stone-oven baked flatbread with fresh rosemary, coarse sea salt and extra virgin olive oil", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(15), RestaurantId = r9, Name = "Margherita",                 Category = "Pizza",          Price = 9.00m,  IsAvailable = true, SortOrder = 15, ImageUrl = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", Description = "San Marzano tomato, fior di latte mozzarella and fresh basil — stone-oven baked", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(16), RestaurantId = r9, Name = "Salame",                     Category = "Pizza",          Price = 11.00m, IsAvailable = true, SortOrder = 16, ImageUrl = "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop", Description = "Tomato sauce, mozzarella and Italian salami, stone-oven baked to a perfectly crisp crust", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(17), RestaurantId = r9, Name = "Vegetale",                   Category = "Pizza",          Price = 12.50m, IsAvailable = true, SortOrder = 17, ImageUrl = "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop", Description = "Tomato sauce, mozzarella and a seasonal medley of fresh market vegetables", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(18), RestaurantId = r9, Name = "Calabrese",                  Category = "Pizza",          Price = 13.00m, IsAvailable = true, SortOrder = 18, ImageUrl = "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop", Description = "Tomato sauce, mozzarella and fiery spicy Italian salami from Calabria", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(19), RestaurantId = r9, Name = "Tonno e Cipolla",            Category = "Pizza",          Price = 12.50m, IsAvailable = true, SortOrder = 19, ImageUrl = "https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&h=300&fit=crop", Description = "Tomato sauce, mozzarella, premium tuna and sweet red onion", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(20), RestaurantId = r9, Name = "Matera",                     Category = "Pizza",          Price = 14.50m, IsAvailable = true, SortOrder = 20, ImageUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", Description = "Tomato sauce, mozzarella, San Daniele Parma ham, fresh rocket and shaved Parmigiano — our signature pizza", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(21), RestaurantId = r9, Name = "Scampi",                     Category = "Pizza",          Price = 15.50m, IsAvailable = true, SortOrder = 21, ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", Description = "Tomato sauce, mozzarella and whole king prawns, finished with garlic and flat-leaf parsley", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(22), RestaurantId = r9, Name = "Spinaci",                    Category = "Pizza",          Price = 13.50m, IsAvailable = true, SortOrder = 22, ImageUrl = "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop", Description = "Creamy Gorgonzola, baby spinach and toasted walnuts", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(23), RestaurantId = r9, Name = "Pizza Mista",                Category = "Pizza",          Price = 14.00m, IsAvailable = true, SortOrder = 23, ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", Description = "The works: salami, cooked ham, mushrooms and peperoni on tomato and mozzarella", CreatedAt = now, UpdatedAt = now },
            // Pasta
            new MenuItem { Id = mr(24), RestaurantId = r9, Name = "Spaghetti Aglio e Olio",     Category = "Pasta",          Price = 11.50m, IsAvailable = true, SortOrder = 24, ImageUrl = "https://images.unsplash.com/photo-1473093226555-0b4e15c91b01?w=400&h=300&fit=crop", Description = "Spaghetti tossed in golden garlic-infused extra virgin olive oil with fresh chilli and parsley", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(25), RestaurantId = r9, Name = "Penne all'Arrabbiata",       Category = "Pasta",          Price = 12.50m, IsAvailable = true, SortOrder = 25, ImageUrl = "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop", Description = "Penne in a fiery tomato and chilli sauce with olives", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(26), RestaurantId = r9, Name = "Spaghetti Carbonara",        Category = "Pasta",          Price = 13.00m, IsAvailable = true, SortOrder = 26, ImageUrl = "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop", Description = "Classic Roman pasta with pancetta, egg yolks, cream and Parmigiano-Reggiano", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(27), RestaurantId = r9, Name = "Spaghetti Napoli",           Category = "Pasta",          Price = 11.00m, IsAvailable = true, SortOrder = 27, ImageUrl = "https://images.unsplash.com/photo-1551183053-bf91798d3e5e?w=400&h=300&fit=crop", Description = "Spaghetti with San Marzano tomato fillets, garlic and fresh basil", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(28), RestaurantId = r9, Name = "Spaghetti Bolognese",        Category = "Pasta",          Price = 13.50m, IsAvailable = true, SortOrder = 28, ImageUrl = "https://images.unsplash.com/photo-1551183053-bf91798d3e5e?w=400&h=300&fit=crop", Description = "Slow-cooked minced beef ragù in a rich San Marzano tomato sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(29), RestaurantId = r9, Name = "Gnocchi e Burro alla Salvia",Category = "Pasta",          Price = 12.00m, IsAvailable = true, SortOrder = 29, ImageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", Description = "Pillowy potato gnocchi tossed in fragrant browned sage butter and Parmigiano", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(30), RestaurantId = r9, Name = "Tagliatelle al Salmone",     Category = "Pasta",          Price = 14.50m, IsAvailable = true, SortOrder = 30, ImageUrl = "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop", Description = "Egg tagliatelle with diced Atlantic salmon in a silky lobster cream sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(31), RestaurantId = r9, Name = "Penne Vegetale",             Category = "Pasta",          Price = 13.00m, IsAvailable = true, SortOrder = 31, ImageUrl = "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", Description = "Penne with a colourful sauté of fresh seasonal market vegetables", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(32), RestaurantId = r9, Name = "Penne con Pollo",            Category = "Pasta",          Price = 13.50m, IsAvailable = true, SortOrder = 32, ImageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", Description = "Penne with tender chicken breast strips and champignons in a light cream and white wine sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(33), RestaurantId = r9, Name = "Tagliatelle dello Chef",     Category = "Pasta",          Price = 15.00m, IsAvailable = true, SortOrder = 33, ImageUrl = "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&h=300&fit=crop", Description = "Chef's tagliatelle with beef tenderloin tips, courgette, fresh tomatoes and basil", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(34), RestaurantId = r9, Name = "Lasagne al Forno",           Category = "Pasta",          Price = 14.00m, IsAvailable = true, SortOrder = 34, ImageUrl = "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop", Description = "Homemade baked lasagne with slow-cooked Bolognese ragù, béchamel and Parmigiano", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(35), RestaurantId = r9, Name = "Tagliatelle Pesto",          Category = "Pasta",          Price = 12.50m, IsAvailable = true, SortOrder = 35, ImageUrl = "https://images.unsplash.com/photo-1473093226555-0b4e15c91b01?w=400&h=300&fit=crop", Description = "Egg tagliatelle coated in a vibrant Genovese pesto", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(36), RestaurantId = r9, Name = "Penne Gorgonzola e Spinaci", Category = "Pasta",          Price = 13.00m, IsAvailable = true, SortOrder = 36, ImageUrl = "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", Description = "Penne with a creamy Gorgonzola sauce and wilted baby spinach", CreatedAt = now, UpdatedAt = now },
            // Handmade Pasta
            new MenuItem { Id = mr(37), RestaurantId = r9, Name = "Ravioli Ricotta e Spinaci",    Category = "Handmade Pasta", Price = 16.50m, IsAvailable = true, SortOrder = 37, ImageUrl = "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", Description = "House-made ravioli filled with ricotta and spinach in a light San Marzano tomato sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(38), RestaurantId = r9, Name = "Ravioli Verde al Manzo",       Category = "Handmade Pasta", Price = 17.50m, IsAvailable = true, SortOrder = 38, ImageUrl = "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", Description = "House-made green ravioli stuffed with minced beef and leek in a light meat ragù", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(39), RestaurantId = r9, Name = "Ravioli alle Castagne",        Category = "Handmade Pasta", Price = 17.50m, IsAvailable = true, SortOrder = 39, ImageUrl = "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", Description = "House-made ravioli filled with chestnut purée in a classic sage brown butter sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(40), RestaurantId = r9, Name = "Ravioli ai Funghi Porcini",    Category = "Handmade Pasta", Price = 17.50m, IsAvailable = true, SortOrder = 40, ImageUrl = "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", Description = "House-made ravioli filled with wild porcini mushrooms in a rich porcini cream sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(41), RestaurantId = r9, Name = "Ravioli Neri al Pesce",        Category = "Handmade Pasta", Price = 18.50m, IsAvailable = true, SortOrder = 41, ImageUrl = "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop", Description = "House-made squid-ink black ravioli filled with fresh fish in a delicate lobster bisque sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(42), RestaurantId = r9, Name = "Linguine Nere ai Granchi",     Category = "Handmade Pasta", Price = 17.50m, IsAvailable = true, SortOrder = 42, ImageUrl = "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop", Description = "House-made squid-ink black linguine with crab meat and courgette in a light tomato sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(43), RestaurantId = r9, Name = "Cannelloni Ricotta e Spinaci", Category = "Handmade Pasta", Price = 16.50m, IsAvailable = true, SortOrder = 43, ImageUrl = "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop", Description = "House-made cannelloni filled with ricotta and spinach, oven-baked under béchamel and tomato", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(44), RestaurantId = r9, Name = "Ravioli Misto (for 2)",        Category = "Handmade Pasta", Price = 38.50m, IsAvailable = true, SortOrder = 44, ImageUrl = "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop", Description = "A generous mixed selection of all house-made ravioli varieties — the perfect sharing feast for two", CreatedAt = now, UpdatedAt = now },
            // Meat
            new MenuItem { Id = mr(45), RestaurantId = r9, Name = "Medaglioni alla Boscaiola",    Category = "Meat",           Price = 22.50m, IsAvailable = true, SortOrder = 45, ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", Description = "Pork fillet medallions with seasonal wild mushrooms in a light cream and white wine sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(46), RestaurantId = r9, Name = "Filetto di Manzo",             Category = "Meat",           Price = 29.50m, IsAvailable = true, SortOrder = 46, ImageUrl = "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=300&fit=crop", Description = "Premium grilled beef tenderloin with seasonal vegetables and your choice of sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(47), RestaurantId = r9, Name = "Filetto di Manzo al Pepe Verde",Category = "Meat",          Price = 31.50m, IsAvailable = true, SortOrder = 47, ImageUrl = "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=300&fit=crop", Description = "Beef tenderloin in a fragrant green peppercorn and cognac cream sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(48), RestaurantId = r9, Name = "Saltimbocca alla Romana",      Category = "Meat",           Price = 22.50m, IsAvailable = true, SortOrder = 48, ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", Description = "Pork fillet medallions wrapped in Parma ham and fresh sage, pan-cooked in white wine", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(49), RestaurantId = r9, Name = "Bistecca alla Gorgonzola",     Category = "Meat",           Price = 25.00m, IsAvailable = true, SortOrder = 49, ImageUrl = "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", Description = "Grilled rump steak topped with a bold, creamy Gorgonzola sauce", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(50), RestaurantId = r9, Name = "Bistecca al Pepe Verde",       Category = "Meat",           Price = 26.00m, IsAvailable = true, SortOrder = 50, ImageUrl = "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop", Description = "Rump steak in a velvety green peppercorn cream sauce, served with seasonal vegetables", CreatedAt = now, UpdatedAt = now },
            // Fish
            new MenuItem { Id = mr(51), RestaurantId = r9, Name = "Scampi alla Griglia",          Category = "Fish",           Price = 25.50m, IsAvailable = true, SortOrder = 51, ImageUrl = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", Description = "5 king prawns grilled on hot lava stone, with lemon, garlic and fresh herbs", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(52), RestaurantId = r9, Name = "Scampi del Matera",            Category = "Fish",           Price = 27.50m, IsAvailable = true, SortOrder = 52, ImageUrl = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", Description = "5 king prawns in the house lobster cream sauce — the seafood signature of Ristorante Matera", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(53), RestaurantId = r9, Name = "Zanderfilet",                  Category = "Fish",           Price = 23.50m, IsAvailable = true, SortOrder = 53, ImageUrl = "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop", Description = "Pan-seared pike-perch fillet with a Pommery wholegrain mustard sauce and seasonal vegetables", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(54), RestaurantId = r9, Name = "Salmone al Vino Bianco",       Category = "Fish",           Price = 24.50m, IsAvailable = true, SortOrder = 54, ImageUrl = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop", Description = "Atlantic salmon fillet poached in white wine with shallots, capers and fresh dill", CreatedAt = now, UpdatedAt = now },
            // Desserts
            new MenuItem { Id = mr(55), RestaurantId = r9, Name = "Tiramisù",                    Category = "Desserts",       Price = 7.00m,  IsAvailable = true, SortOrder = 55, ImageUrl = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop", Description = "Homemade — espresso-soaked Savoiardi, mascarpone cream and a generous dusting of dark cocoa", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(56), RestaurantId = r9, Name = "Panna Cotta",                 Category = "Desserts",       Price = 7.00m,  IsAvailable = true, SortOrder = 56, ImageUrl = "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop", Description = "Silky vanilla cream set dessert with a coulis of puréed seasonal fruits", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(57), RestaurantId = r9, Name = "Tartufo Amaretto",            Category = "Desserts",       Price = 7.50m,  IsAvailable = true, SortOrder = 57, ImageUrl = "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop", Description = "Classic Italian truffle ice cream with an Amaretto di Saronno heart, dusted in dark cocoa", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(58), RestaurantId = r9, Name = "Gelato Misto",                Category = "Desserts",       Price = 6.00m,  IsAvailable = true, SortOrder = 58, ImageUrl = "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop", Description = "Three generous scoops of mixed artisan Italian ice cream", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(59), RestaurantId = r9, Name = "Dessert Misto Matera",        Category = "Desserts",       Price = 11.50m, IsAvailable = true, SortOrder = 59, ImageUrl = "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop", Description = "The house dessert plate — Tiramisù, Panna Cotta, Tartufo and seasonal fruit", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(60), RestaurantId = r9, Name = "Crème Caramel",               Category = "Desserts",       Price = 8.00m,  IsAvailable = true, SortOrder = 60, ImageUrl = "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop", Description = "Classic baked custard with a golden caramel mirror", CreatedAt = now, UpdatedAt = now },
            // Drinks
            new MenuItem { Id = mr(61), RestaurantId = r9, Name = "Chianti Classico",            Category = "Drinks",         Price = 6.50m,  IsAvailable = true, SortOrder = 61, ImageUrl = "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop", Description = "Glass of Chianti Classico DOCG — rich Sangiovese with cherry, leather and earthy notes", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(62), RestaurantId = r9, Name = "Prosecco DOC",                Category = "Drinks",         Price = 5.50m,  IsAvailable = true, SortOrder = 62, ImageUrl = "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=300&fit=crop", Description = "Chilled glass of Italian Prosecco Superiore — fine persistent bubbles, notes of apple and white peach", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(63), RestaurantId = r9, Name = "Espresso",                    Category = "Drinks",         Price = 2.50m,  IsAvailable = true, SortOrder = 63, ImageUrl = "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop", Description = "Double ristretto from our Italian arabica blend", CreatedAt = now, UpdatedAt = now },
            new MenuItem { Id = mr(64), RestaurantId = r9, Name = "Acqua Minerale",              Category = "Drinks",         Price = 3.00m,  IsAvailable = true, SortOrder = 64, ImageUrl = "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop", Description = "Still or sparkling Italian mineral water, 500ml bottle", CreatedAt = now, UpdatedAt = now }
        );
    }
}
