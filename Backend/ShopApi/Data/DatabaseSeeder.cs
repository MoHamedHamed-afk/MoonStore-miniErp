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
