using ShopApi.Models;

namespace ShopApi.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ShopContext context)
    {
        if (!context.Users.Any(u => u.Username == "admin"))
        {
            context.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@2012")
            });
        }

        if (!context.Products.Any())
        {
            context.Products.AddRange(
                new Product { Name = "Premium 3D Hoodie", Description = "Trendy streetwear hoodie floating in mid-air.", Price = 120.00m, CostPrice = 64.00m, Supplier = "Orbit Textile Co.", ImageUrl = "assets/images/premium_3d_hoodie.png", Category = "Winter", StockQuantity = 18, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Futuristic Sneakers", Description = "A pair of premium, futuristic trendy sneakers.", Price = 250.00m, CostPrice = 150.00m, Supplier = "Nova Footwear Lab", ImageUrl = "assets/images/premium_3d_sneakers.png", Category = "Summer", StockQuantity = 12, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Modern Puffer Jacket", Description = "Premium, stylish modern jacket or puffer coat.", Price = 340.00m, CostPrice = 205.00m, Supplier = "Orbit Textile Co.", ImageUrl = "assets/images/premium_3d_jacket.png", Category = "Winter", StockQuantity = 9, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Summer Vintage Shirt", Description = "Lightweight vintage-style summer shirt.", Price = 65.00m, CostPrice = 28.00m, Supplier = "Sunline Apparel", ImageUrl = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800", Category = "Summer", StockQuantity = 30, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Cargo Shorts", Description = "Premium streetwear cargo shorts.", Price = 90.00m, CostPrice = 42.00m, Supplier = "Sunline Apparel", ImageUrl = "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800", Category = "Summer", StockQuantity = 22, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Streetwear Bucket Hat", Description = "Trendy summer bucket hat.", Price = 45.00m, CostPrice = 18.00m, Supplier = "Sunline Apparel", ImageUrl = "https://images.unsplash.com/photo-1521369909029-2afed882ba54?q=80&w=800", Category = "Summer", StockQuantity = 15, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Winter Knit Beanie", Description = "Warm winter knit beanie cap.", Price = 35.00m, CostPrice = 14.00m, Supplier = "North Loom Studio", ImageUrl = "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800", Category = "Winter", StockQuantity = 27, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Tactical Winter Boots", Description = "Heavy duty tactical winter boots.", Price = 210.00m, CostPrice = 126.00m, Supplier = "Nova Footwear Lab", ImageUrl = "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800", Category = "Winter", StockQuantity = 6, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Designer Scarf", Description = "Premium soft designer scarf.", Price = 110.00m, CostPrice = 48.00m, Supplier = "North Loom Studio", ImageUrl = "https://images.unsplash.com/photo-1601379430166-70eeb04e2808?q=80&w=800", Category = "Winter", StockQuantity = 14, CreatedAt = DateTime.UtcNow }
            );
        }
        else if (context.Products.All(product => product.StockQuantity == 0))
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
