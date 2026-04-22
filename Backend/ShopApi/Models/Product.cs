namespace ShopApi.Models;

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = "Summer";
    public string Supplier { get; set; } = "Moon Supply";
    public int StockQuantity { get; set; } = 25;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
