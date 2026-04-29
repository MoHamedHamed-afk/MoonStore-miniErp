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
        "Rejected"
    };

    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pending",
        "Accepted",
        "Rejected",
        "Completed"
    };

    public OrdersController(ShopContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetRole() => User.FindFirstValue(ClaimTypes.Role) ?? "User";
    private int? GetAssignedStoreId()
    {
        var value = User.FindFirstValue("assignedStoreId");
        return int.TryParse(value, out var storeId) ? storeId : null;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .AsQueryable();

        if (GetRole() == "Moderator")
        {
            var storeId = GetAssignedStoreId();
            if (storeId is null) return Forbid();
            query = query.Where(order => order.StoreId == storeId.Value);
        }

        return await query.OrderByDescending(o => o.OrderDate).ToListAsync();
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
    {
        var userId = GetUserId();

        return await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<Order>>> CreateOrder([FromBody] CreateOrderRequest request)
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

        var activeStores = await _context.Stores.AsNoTracking()
            .Where(s => s.IsActive)
            .ToListAsync();

        var orders = new List<Order>();
        if (request.StoreId > 0)
        {
            var store = activeStores.FirstOrDefault(s => s.Id == request.StoreId);
            if (store == null)
            {
                return BadRequest("No valid store is available for this order.");
            }

            var orderResult = BuildOrder(request, request.Items.Where(i => i.Quantity > 0), products, store);
            if (orderResult.Error is not null)
            {
                return BadRequest(orderResult.Error);
            }

            orders.Add(orderResult.Order!);
        }
        else
        {
            var activeStoreIds = activeStores.Select(store => store.Id).ToHashSet();
            var groupedItems = new Dictionary<int, List<CreateOrderItemRequest>>();

            foreach (var item in request.Items.Where(i => i.Quantity > 0))
            {
                var product = products[item.ProductId];
                var storeId = product.AvailableStoreIds
                    .Where(activeStoreIds.Contains)
                    .OrderBy(id => id)
                    .FirstOrDefault();

                if (storeId == 0)
                {
                    return BadRequest($"{product.Name} is not available in any active store.");
                }

                if (!groupedItems.ContainsKey(storeId))
                {
                    groupedItems[storeId] = [];
                }

                groupedItems[storeId].Add(item);
            }

            foreach (var group in groupedItems)
            {
                var store = activeStores.First(s => s.Id == group.Key);
                var orderResult = BuildOrder(request, group.Value, products, store);
                if (orderResult.Error is not null)
                {
                    return BadRequest(orderResult.Error);
                }

                orders.Add(orderResult.Order!);
            }
        }

        _context.Orders.AddRange(orders);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyOrders), orders);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        if (!AllowedStatuses.Contains(status))
        {
            return BadRequest("Invalid order status.");
        }

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();

        if (GetRole() == "Moderator" && order.StoreId != GetAssignedStoreId())
        {
            return Forbid();
        }

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

        order.Status = "Rejected";
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

        if (!string.Equals(order.Status, "Completed", StringComparison.OrdinalIgnoreCase))
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

    private static string? NormalizeOption(string? selectedValue, List<string> allowedValues)
    {
        if (allowedValues.Count == 0)
        {
            return string.IsNullOrWhiteSpace(selectedValue) ? null : selectedValue.Trim();
        }

        if (string.IsNullOrWhiteSpace(selectedValue))
        {
            return allowedValues[0];
        }

        return allowedValues.FirstOrDefault(value => string.Equals(value, selectedValue.Trim(), StringComparison.OrdinalIgnoreCase))
            ?? allowedValues[0];
    }

    private (Order? Order, string? Error) BuildOrder(
        CreateOrderRequest request,
        IEnumerable<CreateOrderItemRequest> items,
        Dictionary<int, Product> products,
        Store store)
    {
        var order = new Order
        {
            UserId = GetUserId(),
            CustomerName = request.CustomerName,
            Email = request.Email,
            Address = request.Address,
            StoreId = store.Id,
            StoreName = store.Name,
            OrderDate = DateTime.UtcNow,
            Status = "Pending"
        };

        foreach (var item in items)
        {
            var product = products[item.ProductId];
            if (!product.AvailableStoreIds.Contains(store.Id))
            {
                return (null, $"{product.Name} is not available in {store.Name}.");
            }

            if (item.Quantity > product.StockQuantity)
            {
                return (null, $"{product.Name} only has {product.StockQuantity} item(s) left in stock.");
            }

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                ProductName = product.Name,
                ProductImageUrl = product.ImageUrl,
                SelectedSize = NormalizeOption(item.SelectedSize, product.Sizes),
                SelectedColor = NormalizeOption(item.SelectedColor, product.Colors),
                UnitPrice = product.Price
            });

            product.StockQuantity -= item.Quantity;
        }

        order.TotalAmount = order.Items.Sum(i => i.UnitPrice * i.Quantity);
        return (order, null);
    }
}
