using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ShopApi.Data;
using ShopApi.Models;

namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ShopContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(ShopContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "super_secret_key_that_is_long_enough_1234567890!");
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Username == "admin" ? "Admin" : "User")
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["Jwt:Issuer"] ?? "ShopApi",
            Audience = _configuration["Jwt:Audience"] ?? "ShopApp"
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return Ok(new { Token = tokenString });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto registerDto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
        {
            return BadRequest("Username already exists");
        }

        var user = new User
        {
            Username = registerDto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Email = registerDto.Email,
            PhoneNumber = registerDto.PhoneNumber
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Registration successful" });
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<AdminCustomerDto>>> GetUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .ToListAsync();

        var userIds = users.Select(user => user.Id).ToList();
        var orders = await _context.Orders
            .AsNoTracking()
            .Where(order => order.UserId.HasValue && userIds.Contains(order.UserId.Value))
            .OrderByDescending(order => order.OrderDate)
            .ToListAsync();

        var customers = users
            .Select(user =>
            {
                var userOrders = orders.Where(order => order.UserId == user.Id).ToList();
                var latestOrder = userOrders.FirstOrDefault();

                return new AdminCustomerDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Role = user.Username == "admin" ? "Admin" : "User",
                    OrdersCount = userOrders.Count,
                    TotalSpent = userOrders.Sum(order => order.TotalAmount),
                    LatestOrderDate = latestOrder?.OrderDate,
                    LatestOrderStatus = latestOrder?.Status
                };
            })
            .OrderByDescending(customer => customer.TotalSpent)
            .ThenBy(customer => customer.Username)
            .ToList();

        return Ok(customers);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == forgotDto.Email);
        if (user == null)
        {
            // For security, don't reveal if user exists, but for this demo we'll return a mock token
            return Ok(new { Message = "If that email exists, a reset link was sent.", MockToken = "mock-reset-token-123" });
        }

        // Return mock token directly to frontend for demonstration
        return Ok(new { Message = "If that email exists, a reset link was sent.", MockToken = $"mock-reset-token-{user.Id}" });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
    {
        // In reality, verify the token. Here, we parse the mock token format: "mock-reset-token-{userId}"
        if (!resetDto.Token.StartsWith("mock-reset-token-"))
        {
            return BadRequest("Invalid token");
        }

        var parts = resetDto.Token.Split('-');
        if (parts.Length != 4 || !int.TryParse(parts[3], out int userId))
        {
            return BadRequest("Invalid token format");
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return BadRequest("Invalid token");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetDto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Password reset successful" });
    }
}
