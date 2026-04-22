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
        return await _context.CartItems.Include(c => c.Product).Where(c => c.UserId == GetUserId()).ToListAsync();
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> AddToCart(int productId)
    {
        var userId = GetUserId();
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return NotFound();
        if (product.StockQuantity <= 0) return BadRequest("This product is out of stock.");

        var cartItem = await _context.CartItems.SingleOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);

        if (cartItem != null)
        {
            if (cartItem.Quantity >= product.StockQuantity)
            {
                return BadRequest("No more stock is available for this item.");
            }
            cartItem.Quantity++;
        }
        else
        {
            _context.CartItems.Add(new CartItem { UserId = userId, ProductId = productId, Quantity = 1 });
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
}
