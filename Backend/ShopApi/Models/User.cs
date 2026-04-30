namespace ShopApi.Models;

public class User
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = "User";
    public int? AssignedStoreId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class AdminCustomerDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = "User";
    public int? AssignedStoreId { get; set; }
    public string? AssignedStoreName { get; set; }
    public bool IsActive { get; set; } = true;
    public int OrdersCount { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? LatestOrderDate { get; set; }
    public string? LatestOrderStatus { get; set; }
}

public class UserLoginDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}

public class UserRegisterDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
    public required string Email { get; set; }
    public string? PhoneNumber { get; set; }
}

public class ModeratorRequestDto
{
    public required string Username { get; set; }
    public string? Password { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public int AssignedStoreId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ForgotPasswordDto
{
    public required string Email { get; set; }
}

public class ResetPasswordDto
{
    public string? Token { get; set; }
    public string? Email { get; set; }
    public string? Otp { get; set; }
    public required string NewPassword { get; set; }
}
