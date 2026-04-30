using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
using ShopApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ShopContext _context;

    public ProductsController(ShopContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await _context.Products.AsNoTracking().ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) return NotFound();
        return product;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        var validationError = await ValidateProductAsync(product);
        if (validationError is not null) return BadRequest(validationError);

        product.Id = 0;
        product.CreatedAt = DateTime.UtcNow;
        NormalizeProduct(product);

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id) return BadRequest();

        var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (existingProduct == null) return NotFound();

        var validationError = await ValidateProductAsync(product);
        if (validationError is not null) return BadRequest(validationError);

        NormalizeProduct(product);
        existingProduct.Name = product.Name.Trim();
        existingProduct.Description = product.Description.Trim();
        existingProduct.Price = product.Price;
        existingProduct.CostPrice = product.CostPrice;
        existingProduct.ImageUrl = product.ImageUrl;
        existingProduct.ImageUrlsCsv = product.ImageUrlsCsv;
        existingProduct.Category = product.Category.Trim();
        existingProduct.Supplier = product.Supplier.Trim();
        existingProduct.StockQuantity = product.StockQuantity;
        existingProduct.SizesCsv = product.SizesCsv;
        existingProduct.ColorsCsv = product.ColorsCsv;
        existingProduct.AvailableStoreIdsCsv = product.AvailableStoreIdsCsv;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Products.Any(e => e.Id == id)) return NotFound();
            else throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string?> ValidateProductAsync(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.Name))
        {
            return "Product name is required.";
        }

        if (product.Name.Length > 140)
        {
            return "Product name is too long.";
        }

        if (string.IsNullOrWhiteSpace(product.Description))
        {
            return "Product description is required.";
        }

        if (product.Price < 0 || product.CostPrice < 0)
        {
            return "Product price and cost cannot be negative.";
        }

        if (product.StockQuantity < 0)
        {
            return "Product stock cannot be negative.";
        }

        if (product.Sizes.Count == 0)
        {
            return "At least one size is required.";
        }

        if (product.Colors.Count == 0)
        {
            return "At least one color is required.";
        }

        if (product.AvailableStoreIds.Count == 0)
        {
            return "At least one available store is required.";
        }

        var activeStoreIds = await _context.Stores
            .Where(store => store.IsActive)
            .Select(store => store.Id)
            .ToListAsync();

        if (product.AvailableStoreIds.Any(storeId => !activeStoreIds.Contains(storeId)))
        {
            return "One or more selected stores are invalid.";
        }

        return null;
    }

    private static void NormalizeProduct(Product product)
    {
        product.Name = product.Name.Trim();
        product.Description = product.Description.Trim();
        product.Category = string.IsNullOrWhiteSpace(product.Category) ? "Unsorted" : product.Category.Trim();
        product.Supplier = string.IsNullOrWhiteSpace(product.Supplier) ? "Moon Supply" : product.Supplier.Trim();
        product.ImageUrls = product.ImageUrls;
        product.Sizes = product.Sizes;
        product.Colors = product.Colors;
        product.AvailableStoreIds = product.AvailableStoreIds;
    }
}
