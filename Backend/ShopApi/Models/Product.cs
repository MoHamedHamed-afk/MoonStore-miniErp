using System.ComponentModel.DataAnnotations.Schema;

namespace ShopApi.Models;

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public string? ImageUrl { get; set; }
    public string ImageUrlsCsv { get; set; } = string.Empty;
    public string Category { get; set; } = "Summer";
    public string Supplier { get; set; } = "Moon Supply";
    public int StockQuantity { get; set; } = 25;
    public string SizesCsv { get; set; } = "S,M,L,XL";
    public string ColorsCsv { get; set; } = "Black,White";
    public string AvailableStoreIdsCsv { get; set; } = "1";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public List<string> Sizes
    {
        get => SplitCsv(SizesCsv);
        set => SizesCsv = JoinCsv(value);
    }

    [NotMapped]
    public List<string> Colors
    {
        get => SplitCsv(ColorsCsv);
        set => ColorsCsv = JoinCsv(value);
    }

    [NotMapped]
    public List<string> ImageUrls
    {
        get
        {
            var urls = SplitCsv(ImageUrlsCsv);
            if (!string.IsNullOrWhiteSpace(ImageUrl) && !urls.Contains(ImageUrl))
            {
                urls.Insert(0, ImageUrl);
            }

            return urls;
        }
        set
        {
            var urls = value?
                .Where(url => !string.IsNullOrWhiteSpace(url))
                .Select(url => url.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList() ?? [];

            ImageUrlsCsv = JoinCsv(urls);
            ImageUrl = urls.FirstOrDefault();
        }
    }

    [NotMapped]
    public List<int> AvailableStoreIds
    {
        get => SplitCsv(AvailableStoreIdsCsv)
            .Select(value => int.TryParse(value, out var id) ? id : 0)
            .Where(id => id > 0)
            .Distinct()
            .ToList();
        set => AvailableStoreIdsCsv = string.Join(",", value.Distinct());
    }

    private static List<string> SplitCsv(string? value) => string.IsNullOrWhiteSpace(value)
        ? []
        : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

    private static string JoinCsv(IEnumerable<string>? values) => values is null
        ? string.Empty
        : string.Join(",", values.Where(value => !string.IsNullOrWhiteSpace(value)).Select(value => value.Trim()).Distinct(StringComparer.OrdinalIgnoreCase));
}
