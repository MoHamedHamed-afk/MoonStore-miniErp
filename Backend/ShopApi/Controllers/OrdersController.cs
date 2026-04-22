using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
using ShopApi.Models;

namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ShopContext _context;
    private static readonly HashSet<string> StockRestoredStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Cancelled",
        "Refunded"
    };

    public OrdersController(ShopContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        return await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
    {
        var userId = GetUserId();

        return await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        if (request.Items.Count == 0)
        {
            return BadRequest("Order must include at least one item.");
        }

        var requestedProductIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => requestedProductIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        if (products.Count != requestedProductIds.Count)
        {
            return BadRequest("One or more products no longer exist.");
        }

        var order = new Order
        {
            UserId = GetUserId(),
            CustomerName = request.CustomerName,
            Email = request.Email,
            Address = request.Address,
            OrderDate = DateTime.UtcNow,
            Status = "Pending"
        };

        foreach (var item in request.Items.Where(i => i.Quantity > 0))
        {
            var product = products[item.ProductId];
            if (item.Quantity > product.StockQuantity)
            {
                return BadRequest($"{product.Name} only has {product.StockQuantity} item(s) left in stock.");
            }

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                ProductName = product.Name,
                ProductImageUrl = product.ImageUrl,
                UnitPrice = product.Price
            });

            product.StockQuantity -= item.Quantity;
        }

        order.TotalAmount = order.Items.Sum(i => i.UnitPrice * i.Quantity);

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyOrders), new { id = order.Id }, order);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();

        var previousStatus = order.Status;
        order.Status = status;

        if (!StockRestoredStatuses.Contains(previousStatus) && StockRestoredStatuses.Contains(status))
        {
            await RestoreStockAsync(order);
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelMyOrder(int id)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
        {
            return NotFound();
        }

        if (!string.Equals(order.Status, "Pending", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Only pending orders can be cancelled.");
        }

        order.Status = "Cancelled";
        await RestoreStockAsync(order);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/return-request")]
    public async Task<IActionResult> RequestReturn(int id)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
        {
            return NotFound();
        }

        if (!string.Equals(order.Status, "Delivered", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Only delivered orders can be returned.");
        }

        order.Status = "ReturnRequested";
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task RestoreStockAsync(Order order)
    {
        var productIds = order.Items
            .Select(item => item.ProductId)
            .Distinct()
            .ToList();

        var products = await _context.Products
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id);

        foreach (var item in order.Items)
        {
            if (products.TryGetValue(item.ProductId, out var product))
            {
                product.StockQuantity += item.Quantity;
            }
        }
    }
}
