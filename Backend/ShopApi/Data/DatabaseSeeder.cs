using ShopApi.Models;

namespace ShopApi.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ShopContext context)
    {
        if (!context.Stores.Any())
        {
            context.Stores.AddRange(
                new Store { Name = "Store 1", IsActive = true },
                new Store { Name = "Store 2", IsActive = true },
                new Store { Name = "Store 3", IsActive = true }
            );
            await context.SaveChangesAsync();
        }

        if (!context.Users.Any(u => u.Username == "admin"))
        {
            context.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@2012"),
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

        if (!context.Users.Any(user => user.Username == "moderator1"))
        {
            context.Users.Add(new User
            {
                Username = "moderator1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("moderator123"),
                Role = "Moderator",
                AssignedStoreId = 1,
                IsActive = true,
                Email = "moderator1@moon.local"
            });
        }

        if (!context.Products.Any())
        {
            context.Products.AddRange(
                new Product { Name = "Premium 3D Hoodie", Description = "Trendy streetwear hoodie floating in mid-air.", Price = 120.00m, CostPrice = 64.00m, Supplier = "Orbit Textile Co.", ImageUrl = "assets/images/premium_3d_hoodie.png", Category = "Winter", StockQuantity = 18, SizesCsv = "S,M,L,XL", ColorsCsv = "Black,Gray", AvailableStoreIdsCsv = "1,2", CreatedAt = DateTime.UtcNow },
                new Product { Name = "Futuristic Sneakers", Description = "A pair of premium, futuristic trendy sneakers.", Price = 250.00m, CostPrice = 150.00m, Supplier = "Nova Footwear Lab", ImageUrl = "assets/images/premium_3d_sneakers.png", Category = "Summer", StockQuantity = 12, SizesCsv = "40,41,42,43,44", ColorsCsv = "White,Black", AvailableStoreIdsCsv = "1,3", CreatedAt = DateTime.UtcNow },
                new Product { Name = "Modern Puffer Jacket", Description = "Premium, stylish modern jacket or puffer coat.", Price = 340.00m, CostPrice = 205.00m, Supplier = "Orbit Textile Co.", ImageUrl = "assets/images/premium_3d_jacket.png", Category = "Winter", StockQuantity = 9, SizesCsv = "M,L,XL", ColorsCsv = "Black,Navy", AvailableStoreIdsCsv = "2,3", CreatedAt = DateTime.UtcNow }
            );
        }
        else
        {
            foreach (var product in context.Products)
            {
                if (string.IsNullOrWhiteSpace(product.SizesCsv)) product.SizesCsv = "S,M,L,XL";
                if (string.IsNullOrWhiteSpace(product.ColorsCsv)) product.ColorsCsv = "Black,White";
                if (string.IsNullOrWhiteSpace(product.AvailableStoreIdsCsv)) product.AvailableStoreIdsCsv = "1";
            }
        }
        if (context.Products.All(product => product.StockQuantity == 0))
        {
            var fallbackStock = new Dictionary<string, int>
            {
                ["Premium 3D Hoodie"] = 18,
                ["Futuristic Sneakers"] = 12,
                ["Modern Puffer Jacket"] = 9,
                ["Summer Vintage Shirt"] = 30,
                ["Cargo Shorts"] = 22,
                ["Streetwear Bucket Hat"] = 15,
                ["Winter Knit Beanie"] = 27,
                ["Tactical Winter Boots"] = 6,
                ["Designer Scarf"] = 14
            };

            foreach (var product in context.Products)
            {
                if (fallbackStock.TryGetValue(product.Name, out var stock))
                {
                    product.StockQuantity = stock;
                }
            }
        }

        if (context.Products.All(product => product.CostPrice == 0))
        {
            var fallbackCosts = new Dictionary<string, (decimal CostPrice, string Supplier)>
            {
                ["Premium 3D Hoodie"] = (64.00m, "Orbit Textile Co."),
                ["Futuristic Sneakers"] = (150.00m, "Nova Footwear Lab"),
                ["Modern Puffer Jacket"] = (205.00m, "Orbit Textile Co."),
                ["Summer Vintage Shirt"] = (28.00m, "Sunline Apparel"),
                ["Cargo Shorts"] = (42.00m, "Sunline Apparel"),
                ["Streetwear Bucket Hat"] = (18.00m, "Sunline Apparel"),
                ["Winter Knit Beanie"] = (14.00m, "North Loom Studio"),
                ["Tactical Winter Boots"] = (126.00m, "Nova Footwear Lab"),
                ["Designer Scarf"] = (48.00m, "North Loom Studio")
            };

            foreach (var product in context.Products)
            {
                if (fallbackCosts.TryGetValue(product.Name, out var entry))
                {
                    product.CostPrice = entry.CostPrice;
                    product.Supplier = entry.Supplier;
                }
            }
        }

        await context.SaveChangesAsync();
    }
}
