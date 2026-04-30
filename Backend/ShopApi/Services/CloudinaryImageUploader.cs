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
        IsSignedUploadConfigured || IsUnsignedUploadConfigured;

    private bool IsSignedUploadConfigured =>
        !string.IsNullOrWhiteSpace(GetSetting("Cloudinary:CloudName", "CLOUDINARY_CLOUD_NAME")) &&
        !string.IsNullOrWhiteSpace(GetSetting("Cloudinary:ApiKey", "CLOUDINARY_API_KEY")) &&
        !string.IsNullOrWhiteSpace(GetSetting("Cloudinary:ApiSecret", "CLOUDINARY_API_SECRET"));

    private bool IsUnsignedUploadConfigured =>
        !string.IsNullOrWhiteSpace(GetSetting("Cloudinary:CloudName", "CLOUDINARY_CLOUD_NAME")) &&
        !string.IsNullOrWhiteSpace(GetSetting("Cloudinary:UploadPreset", "CLOUDINARY_UPLOAD_PRESET"));

    public async Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken)
    {
        var cloudName = GetSetting("Cloudinary:CloudName", "CLOUDINARY_CLOUD_NAME")!;
        var apiKey = GetSetting("Cloudinary:ApiKey", "CLOUDINARY_API_KEY");
        var apiSecret = GetSetting("Cloudinary:ApiSecret", "CLOUDINARY_API_SECRET");
        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
        {
            var uploadPreset = GetSetting("Cloudinary:UploadPreset", "CLOUDINARY_UPLOAD_PRESET")!;
            return await UploadUnsignedAsync(cloudName, uploadPreset, file, cancellationToken);
        }

        var folder = GetSetting("Cloudinary:Folder", "CLOUDINARY_FOLDER") ?? "moon-store/products";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

        var parameters = new SortedDictionary<string, string>
        {
            ["folder"] = folder,
            ["timestamp"] = timestamp
        };

        var signaturePayload = string.Join("&", parameters.Select(pair => $"{pair.Key}={pair.Value}")) + apiSecret;
        var signature = Convert.ToHexString(SHA1.HashData(Encoding.UTF8.GetBytes(signaturePayload))).ToLowerInvariant();

        var fileData = await ToDataUriAsync(file, cancellationToken);
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["file"] = fileData,
            ["api_key"] = apiKey,
            ["timestamp"] = timestamp,
            ["folder"] = folder,
            ["signature"] = signature
        });

        var endpoint = $"https://api.cloudinary.com/v1_1/{cloudName}/image/upload";
        using var response = await _httpClient.PostAsync(endpoint, content, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Cloudinary signed upload failed: {responseBody}");
        }

        using var json = JsonDocument.Parse(responseBody);
        return json.RootElement.TryGetProperty("secure_url", out var secureUrl)
            ? secureUrl.GetString() ?? throw new InvalidOperationException("Cloudinary did not return a secure URL.")
            : throw new InvalidOperationException("Cloudinary did not return a secure URL.");
    }

    private async Task<string> UploadUnsignedAsync(
        string cloudName,
        string uploadPreset,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        using var content = new MultipartFormDataContent();
        content.Add(new StringContent(uploadPreset), "upload_preset");
        var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(file.ContentType);
        content.Add(fileContent, "file", file.FileName);

        var endpoint = $"https://api.cloudinary.com/v1_1/{cloudName}/image/upload";
        using var response = await _httpClient.PostAsync(endpoint, content, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Cloudinary unsigned upload failed for preset '{uploadPreset}': {responseBody}");
        }

        using var json = JsonDocument.Parse(responseBody);
        return json.RootElement.TryGetProperty("secure_url", out var secureUrl)
            ? secureUrl.GetString() ?? throw new InvalidOperationException("Cloudinary did not return a secure URL.")
            : throw new InvalidOperationException("Cloudinary did not return a secure URL.");
    }

    private static async Task<string> ToDataUriAsync(IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        using var memory = new MemoryStream();
        await stream.CopyToAsync(memory, cancellationToken);
        return $"data:{file.ContentType};base64,{Convert.ToBase64String(memory.ToArray())}";
    }

    private string? GetSetting(string dotNetKey, string environmentKey)
    {
        return (_configuration[dotNetKey] ?? _configuration[environmentKey])?.Trim().Trim('"', '\'');
    }
}
