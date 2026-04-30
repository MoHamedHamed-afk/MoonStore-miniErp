using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;

namespace ShopApi.Services;

public class CloudinaryImageUploader
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public CloudinaryImageUploader(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(GetSetting("Cloudinary:CloudName", "CLOUDINARY_CLOUD_NAME")) &&
        !string.IsNullOrWhiteSpace(GetSetting("Cloudinary:ApiKey", "CLOUDINARY_API_KEY")) &&
        !string.IsNullOrWhiteSpace(GetSetting("Cloudinary:ApiSecret", "CLOUDINARY_API_SECRET"));

    public async Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken)
    {
        var cloudName = GetSetting("Cloudinary:CloudName", "CLOUDINARY_CLOUD_NAME")!;
        var apiKey = GetSetting("Cloudinary:ApiKey", "CLOUDINARY_API_KEY")!;
        var apiSecret = GetSetting("Cloudinary:ApiSecret", "CLOUDINARY_API_SECRET")!;
        var folder = GetSetting("Cloudinary:Folder", "CLOUDINARY_FOLDER") ?? "moon-store/products";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

        var parameters = new SortedDictionary<string, string>
        {
            ["folder"] = folder,
            ["timestamp"] = timestamp
        };

        var signaturePayload = string.Join("&", parameters.Select(pair => $"{pair.Key}={pair.Value}")) + apiSecret;
        var signature = Convert.ToHexString(SHA1.HashData(Encoding.UTF8.GetBytes(signaturePayload))).ToLowerInvariant();

        await using var stream = file.OpenReadStream();
        using var content = new MultipartFormDataContent();
        var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(file.ContentType);
        content.Add(fileContent, "file", file.FileName);
        content.Add(new StringContent(apiKey), "api_key");
        content.Add(new StringContent(timestamp), "timestamp");
        content.Add(new StringContent(folder), "folder");
        content.Add(new StringContent(signature), "signature");

        var endpoint = $"https://api.cloudinary.com/v1_1/{cloudName}/image/upload";
        using var response = await _httpClient.PostAsync(endpoint, content, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Cloudinary upload failed: {responseBody}");
        }

        using var json = JsonDocument.Parse(responseBody);
        return json.RootElement.TryGetProperty("secure_url", out var secureUrl)
            ? secureUrl.GetString() ?? throw new InvalidOperationException("Cloudinary did not return a secure URL.")
            : throw new InvalidOperationException("Cloudinary did not return a secure URL.");
    }

    private string? GetSetting(string dotNetKey, string environmentKey)
    {
        return (_configuration[dotNetKey] ?? _configuration[environmentKey])?.Trim();
    }
}
