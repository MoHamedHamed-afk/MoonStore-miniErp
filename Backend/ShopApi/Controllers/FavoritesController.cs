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
public class FavoritesController : ControllerBase
{
    private readonly ShopContext _context;

    public FavoritesController(ShopContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Favorite>>> GetFavorites()
    {
        return await _context.Favorites.Include(f => f.Product).Where(f => f.UserId == GetUserId()).ToListAsync();
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> AddFavorite(int productId)
    {
        var userId = GetUserId();
        if (await _context.Favorites.AnyAsync(f => f.UserId == userId && f.ProductId == productId))
        {
            return Ok(); // Already added
        }

        _context.Favorites.Add(new Favorite { UserId = userId, ProductId = productId });
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFavorite(int productId)
    {
        var favorite = await _context.Favorites.SingleOrDefaultAsync(f => f.UserId == GetUserId() && f.ProductId == productId);
        if (favorite == null) return NotFound();

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
