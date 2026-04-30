using ShopApi.Models;

namespace ShopApi.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ShopContext context, IConfiguration configuration)
    {
        var adminPassword = GetSeedValue(configuration, "AdminPassword");
        var moderatorPassword = GetSeedValue(configuration, "ModeratorPassword");
        var backupAdminPassword = GetSeedValue(configuration, "BackupAdminPassword");

        if (!context.Stores.Any())
        {
            context.Stores.AddRange(
                new Store { Name = "Store 1", IsActive = true },
                new Store { Name = "Store 2", IsActive = true },
                new Store { Name = "Store 3", IsActive = true }
            );
            await context.SaveChangesAsync();
        }

        if (!context.Users.Any(u => u.Username == "admin") && !string.IsNullOrWhiteSpace(adminPassword))
        {
            context.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = "Admin",
                IsActive = true
            });
        }

        var legacyAdmin = context.Users.FirstOrDefault(user => user.Username == "admin");
        if (legacyAdmin is not null)
        {
            legacyAdmin.Role = "Admin";
            legacyAdmin.IsActive = true;
        }

        if (!context.Users.Any(user => user.Username == "backup_admin") && !string.IsNullOrWhiteSpace(backupAdminPassword))
        {
            context.Users.Add(new User
            {
                Username = "backup_admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(backupAdminPassword),
                Role = "Admin",
                IsActive = true,
                Email = "backup@moon.local"
            });
        }

        var backupAdmin = context.Users.FirstOrDefault(user => user.Username == "backup_admin");
        if (backupAdmin is not null)
        {
            backupAdmin.Role = "Admin";
            backupAdmin.IsActive = true;
        }

        if (!context.Users.Any(user => user.Username == "moderator1") && !string.IsNullOrWhiteSpace(moderatorPassword))
        {
            context.Users.Add(new User
            {
                Username = "moderator1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(moderatorPassword),
                Role = "Moderator",
                AssignedStoreId = 1,
                IsActive = true,
                Email = "moderator1@moon.local"
            });
        }

        RemoveLegacySampleProducts(context);

        if (!context.Products.Any())
        {
            context.Products.AddRange(CreateFallbackProducts());
        }

        if (context.Products.Any())
        {
            foreach (var product in context.Products)
            {
                if (string.IsNullOrWhiteSpace(product.SizesCsv)) product.SizesCsv = "S,M,L,XL";
                if (string.IsNullOrWhiteSpace(product.ColorsCsv)) product.ColorsCsv = "Black,White";
                if (string.IsNullOrWhiteSpace(product.AvailableStoreIdsCsv)) product.AvailableStoreIdsCsv = "1";
            }
        }

        await context.SaveChangesAsync();
    }

    private static void RemoveLegacySampleProducts(ShopContext context)
    {
        var legacySampleNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Premium 3D Hoodie",
            "Futuristic Sneakers",
            "Modern Puffer Jacket",
            "Summer Vintage Shirt",
            "Cargo Shorts",
            "Streetwear Bucket Hat",
            "Winter Knit Beanie",
            "Tactical Winter Boots",
            "Designer Scarf"
        };

        var legacySamples = context.Products
            .AsEnumerable()
            .Where(product => legacySampleNames.Contains(product.Name))
            .ToList();

        if (legacySamples.Count > 0)
        {
            context.Products.RemoveRange(legacySamples);
        }
    }

    private static IEnumerable<Product> CreateFallbackProducts()
    {
        var now = DateTime.UtcNow;
        return new[]
        {
            new Product
            {
                Name = "Rose Moon Hoodie Set",
                Description = "Soft rose hoodie and wide-leg pants with a quiet premium streetwear mood.",
                Price = 1450m,
                CostPrice = 820m,
                ImageUrl = "assets/images/moon-look-pink-set.png",
                Category = "Winter",
                StockQuantity = 18,
                SizesCsv = "S,M,L,XL",
                ColorsCsv = "Rose,Black",
                AvailableStoreIdsCsv = "1,2",
                CreatedAt = now
            },
            new Product
            {
                Name = "Charcoal Signature Set",
                Description = "A relaxed charcoal matching set designed for bold everyday comfort.",
                Price = 1550m,
                CostPrice = 900m,
                ImageUrl = "assets/images/moon-look-charcoal-set.png",
                Category = "Winter",
                StockQuantity = 16,
                SizesCsv = "S,M,L,XL",
                ColorsCsv = "Charcoal,Black",
                AvailableStoreIdsCsv = "1,3",
                CreatedAt = now
            },
            new Product
            {
                Name = "Burgundy Night Set",
                Description = "Deep burgundy lounge set with a statement premium finish.",
                Price = 1650m,
                CostPrice = 940m,
                ImageUrl = "assets/images/moon-look-burgundy-set.png",
                Category = "Winter",
                StockQuantity = 14,
                SizesCsv = "S,M,L,XL",
                ColorsCsv = "Burgundy,Black",
                AvailableStoreIdsCsv = "2,3",
                CreatedAt = now
            },
            new Product
            {
                Name = "Pink Denim Moon Hoodie",
                Description = "Bright pink hoodie paired with oversized denim energy for standout summer nights.",
                Price = 1250m,
                CostPrice = 710m,
                ImageUrl = "assets/images/moon-look-pink-hoodie.png",
                Category = "Summer",
                StockQuantity = 20,
                SizesCsv = "S,M,L,XL",
                ColorsCsv = "Pink,Blue",
                AvailableStoreIdsCsv = "1,2",
                CreatedAt = now
            },
            new Product
            {
                Name = "Cream Breeze Set",
                Description = "Light cream two-piece set made for clean, effortless warm-weather styling.",
                Price = 1350m,
                CostPrice = 760m,
                ImageUrl = "assets/images/moon-look-cream-set.png",
                Category = "Summer",
                StockQuantity = 17,
                SizesCsv = "S,M,L,XL",
                ColorsCsv = "Cream,White",
                AvailableStoreIdsCsv = "1,3",
                CreatedAt = now
            },
            new Product
            {
                Name = "Layered Lounge Moon Set",
                Description = "Layered neutral lounge fit with soft movement and a polished Moon Store look.",
                Price = 1500m,
                CostPrice = 860m,
                ImageUrl = "assets/images/moon-look-layered-lounge.png",
                Category = "Summer",
                StockQuantity = 15,
                SizesCsv = "S,M,L,XL",
                ColorsCsv = "Beige,Light Blue",
                AvailableStoreIdsCsv = "2,3",
                CreatedAt = now
            }
        };
    }

    private static string? GetSeedValue(IConfiguration configuration, string key)
    {
        return (configuration[$"Seed:{key}"] ?? configuration[$"SEED_{ToSnakeCase(key)}"])?.Trim();
    }

    private static string ToSnakeCase(string value)
    {
        return string.Concat(value.Select((character, index) =>
            index > 0 && char.IsUpper(character) ? $"_{character}" : character.ToString())).ToUpperInvariant();
    }
}
