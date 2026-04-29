namespace ShopApi.Models;

public class CartItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? SelectedSize { get; set; }
    public string? SelectedColor { get; set; }
    public decimal UnitPrice { get; set; }
    
    public Product? Product { get; set; }
}

public class AddCartItemRequest
{
    public string? SelectedSize { get; set; }
    public string? SelectedColor { get; set; }
    public int Quantity { get; set; } = 1;
}
