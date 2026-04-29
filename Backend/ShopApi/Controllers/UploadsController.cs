using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopApi.Data;
using ShopApi.Services;

namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private const long MaxImageBytes = 10 * 1024 * 1024;
    private static readonly Dictionary<string, string> AllowedImageTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
        ["image/gif"] = ".gif"
    };

    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly CloudinaryImageUploader _cloudinaryImageUploader;

    public UploadsController(
        IWebHostEnvironment environment,
        IConfiguration configuration,
        CloudinaryImageUploader cloudinaryImageUploader)
    {
        _environment = environment;
        _configuration = configuration;
        _cloudinaryImageUploader = cloudinaryImageUploader;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (file.Length > MaxImageBytes)
            return BadRequest("Image is too large. Please upload an image up to 10MB.");

        if (!AllowedImageTypes.TryGetValue(file.ContentType, out var safeExtension))
            return BadRequest("Unsupported image type. Please upload JPG, PNG, WebP, or GIF.");

        if (_cloudinaryImageUploader.IsConfigured)
        {
            var cloudinaryUrl = await _cloudinaryImageUploader.UploadAsync(file, cancellationToken);
            return Ok(new { Url = cloudinaryUrl, Provider = "cloudinary" });
        }

        var uploadsFolder = AppPaths.ResolveUploadsPath(_environment, _configuration);
        Directory.CreateDirectory(uploadsFolder);

        var originalName = Path.GetFileNameWithoutExtension(file.FileName);
        var safeName = string.Concat(originalName.Select(character =>
            char.IsLetterOrDigit(character) || character is '-' or '_' ? character : '-'));

        if (string.IsNullOrWhiteSpace(safeName))
        {
            safeName = "product-image";
        }

        var uniqueFileName = $"{Guid.NewGuid():N}_{safeName}{safeExtension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        var fileUrl = $"/uploads/{uniqueFileName}";
        return Ok(new { Url = fileUrl });
    }
}
