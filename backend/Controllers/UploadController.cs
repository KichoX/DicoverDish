using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscoverDish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController(IWebHostEnvironment env) : ControllerBase
{
    private static readonly string[] AllowedTypes =
        ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

    [Authorize(Roles = "Admin")]
    [HttpPost]
    [RequestSizeLimit(15 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            throw new ArgumentException("No file provided.");

        if (!AllowedTypes.Contains(file.ContentType.ToLowerInvariant()))
            throw new ArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed.");

        if (file.Length > 10 * 1024 * 1024)
            throw new ArgumentException("File must be under 10 MB.");

        var root = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsDir = Path.Combine(root, "uploads");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext)) ext = ".jpg";
        var filename = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, filename);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new { url = $"{baseUrl}/uploads/{filename}" });
    }
}
