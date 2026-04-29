using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ShopApi.Data;
using ShopApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ShopContext _context;

    public CartController(ShopContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CartItem>>> GetCart()
    {
        return await _context.CartItems
            .AsNoTracking()
            .Include(c => c.Product)
            .Where(c => c.UserId == GetUserId())
            .ToListAsync();
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> AddToCart(int productId, [FromBody] AddCartItemRequest? request)
    {
        var userId = GetUserId();
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return NotFound();
        if (product.StockQuantity <= 0) return BadRequest("This product is out of stock.");

        var quantityToAdd = Math.Max(1, request?.Quantity ?? 1);
        var selectedSize = NormalizeOption(request?.SelectedSize, product.Sizes);
        var selectedColor = NormalizeOption(request?.SelectedColor, product.Colors);

        var cartItem = await _context.CartItems.SingleOrDefaultAsync(c =>
            c.UserId == userId &&
            c.ProductId == productId &&
            c.SelectedSize == selectedSize &&
            c.SelectedColor == selectedColor);

        if (cartItem != null)
        {
            if (cartItem.Quantity + quantityToAdd > product.StockQuantity)
            {
                return BadRequest("No more stock is available for this item.");
            }
            cartItem.Quantity += quantityToAdd;
        }
        else
        {
            if (quantityToAdd > product.StockQuantity)
            {
                return BadRequest("Requested quantity exceeds available stock.");
            }

            _context.CartItems.Add(new CartItem
            {
                UserId = userId,
                ProductId = productId,
                Quantity = quantityToAdd,
                SelectedSize = selectedSize,
                SelectedColor = selectedColor,
                UnitPrice = product.Price
            });
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuantity(int id, [FromBody] int quantity)
    {
        var cartItem = await _context.CartItems.FindAsync(id);
        if (cartItem == null || cartItem.UserId != GetUserId()) return NotFound();
        if (quantity <= 0)
        {
            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return Ok();
        }

        var product = await _context.Products.FindAsync(cartItem.ProductId);
        if (product == null) return NotFound();
        if (quantity > product.StockQuantity)
        {
            return BadRequest("Requested quantity exceeds available stock.");
        }

        cartItem.Quantity = quantity;
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromCart(int id)
    {
        var cartItem = await _context.CartItems.FindAsync(id);
        if (cartItem == null || cartItem.UserId != GetUserId()) return NotFound();

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var items = await _context.CartItems.Where(c => c.UserId == GetUserId()).ToListAsync();
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
        return Ok();
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
}
