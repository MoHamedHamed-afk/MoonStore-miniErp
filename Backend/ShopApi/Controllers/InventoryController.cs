using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopApi.Data;

namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class InventoryController : ControllerBase
{
    private readonly ShopContext _context;

    public InventoryController(ShopContext context)
    {
        _context = context;
    }

    [HttpGet("restock-suggestions")]
    public async Task<ActionResult<IEnumerable<RestockSuggestionDto>>> GetRestockSuggestions()
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        var salesLookup = await _context.OrderItems
            .Where(item => item.Order != null && item.Order.OrderDate >= thirtyDaysAgo)
            .Where(item => item.Order!.Status != "Cancelled" && item.Order.Status != "Refunded")
            .GroupBy(item => item.ProductId)
            .Select(group => new
            {
                ProductId = group.Key,
                UnitsSold = group.Sum(item => item.Quantity)
            })
            .ToDictionaryAsync(item => item.ProductId, item => item.UnitsSold);

        var suggestions = await _context.Products
            .AsNoTracking()
            .OrderBy(product => product.Supplier)
            .ThenBy(product => product.Name)
            .Select(product => new RestockSuggestionDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Supplier = string.IsNullOrWhiteSpace(product.Supplier) ? "Moon Supply" : product.Supplier,
                Category = product.Category,
                ImageUrl = product.ImageUrl,
                CurrentStock = product.StockQuantity,
                CostPrice = product.CostPrice
            })
            .ToListAsync();

        foreach (var suggestion in suggestions)
        {
            suggestion.UnitsSoldLast30Days = salesLookup.GetValueOrDefault(suggestion.ProductId);
            var targetStock = Math.Max(12, suggestion.UnitsSoldLast30Days + 4);
            suggestion.RecommendedQuantity = Math.Max(0, targetStock - suggestion.CurrentStock);
            suggestion.StockGap = Math.Max(0, 5 - suggestion.CurrentStock);
            suggestion.EstimatedCost = suggestion.RecommendedQuantity * suggestion.CostPrice;
            suggestion.Priority = suggestion.CurrentStock <= 0
                ? "Critical"
                : suggestion.CurrentStock <= 3 || suggestion.UnitsSoldLast30Days > suggestion.CurrentStock
                    ? "High"
                    : "Normal";
        }

        return Ok(suggestions
            .Where(item => item.RecommendedQuantity > 0)
            .OrderByDescending(item => item.Priority == "Critical")
            .ThenByDescending(item => item.Priority == "High")
            .ThenBy(item => item.Supplier)
            .ThenByDescending(item => item.UnitsSoldLast30Days)
            .ThenBy(item => item.ProductName));
    }
}

public class RestockSuggestionDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int CurrentStock { get; set; }
    public int UnitsSoldLast30Days { get; set; }
    public int RecommendedQuantity { get; set; }
    public int StockGap { get; set; }
    public decimal CostPrice { get; set; }
    public decimal EstimatedCost { get; set; }
    public string Priority { get; set; } = "Normal";
}
