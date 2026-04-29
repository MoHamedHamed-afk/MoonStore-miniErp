using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
using ShopApi.Models;

namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly ShopContext _context;

    public StoresController(ShopContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Store>>> GetStores()
    {
        return await _context.Stores
            .AsNoTracking()
            .Where(store => store.IsActive)
            .OrderBy(store => store.Id)
            .ToListAsync();
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Store>> CreateStore(Store store)
    {
        _context.Stores.Add(store);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetStores), new { id = store.Id }, store);
    }
}
