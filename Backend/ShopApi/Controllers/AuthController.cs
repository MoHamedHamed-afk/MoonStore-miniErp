using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Claims;
using System.Security.Cryptography;
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
    private static readonly ConcurrentDictionary<string, ResetOtpEntry> ResetOtps = new();

    public AuthController(ShopContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "JWT signing key is not configured.");
        }

        var key = Encoding.UTF8.GetBytes(jwtKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("assignedStoreId", user.AssignedStoreId?.ToString() ?? string.Empty)
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
        var storeLookup = await _context.Stores.AsNoTracking().ToDictionaryAsync(store => store.Id, store => store.Name);
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
                    Role = user.Role,
                    AssignedStoreId = user.AssignedStoreId,
                    AssignedStoreName = user.AssignedStoreId.HasValue && storeLookup.TryGetValue(user.AssignedStoreId.Value, out var storeName) ? storeName : null,
                    IsActive = user.IsActive,
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

    [HttpGet("moderators")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<AdminCustomerDto>>> GetModerators()
    {
        var storeLookup = await _context.Stores.AsNoTracking().ToDictionaryAsync(store => store.Id, store => store.Name);
        var moderators = await _context.Users
            .AsNoTracking()
            .Where(user => user.Role == "Moderator")
            .OrderBy(user => user.Username)
            .ToListAsync();

        return moderators
            .Select(user => new AdminCustomerDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                AssignedStoreId = user.AssignedStoreId,
                AssignedStoreName = user.AssignedStoreId.HasValue && storeLookup.TryGetValue(user.AssignedStoreId.Value, out var storeName) ? storeName : null,
                IsActive = user.IsActive
            })
            .ToList();
    }

    [HttpPost("moderators")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateModerator([FromBody] ModeratorRequestDto request)
    {
        if (!await _context.Stores.AnyAsync(store => store.Id == request.AssignedStoreId && store.IsActive))
        {
            return BadRequest("Store does not exist.");
        }

        if (await _context.Users.AnyAsync(user => user.Username == request.Username))
        {
            return BadRequest("Username already exists");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            return BadRequest("Moderator password must be at least 6 characters.");
        }

        var moderator = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Role = "Moderator",
            AssignedStoreId = request.AssignedStoreId,
            IsActive = request.IsActive
        };

        _context.Users.Add(moderator);
        await _context.SaveChangesAsync();
        return Ok(new { moderator.Id, moderator.Username, moderator.AssignedStoreId });
    }

    [HttpPut("moderators/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateModerator(int id, [FromBody] ModeratorRequestDto request)
    {
        var moderator = await _context.Users.FirstOrDefaultAsync(user => user.Id == id && user.Role == "Moderator");
        if (moderator == null) return NotFound();

        if (!await _context.Stores.AnyAsync(store => store.Id == request.AssignedStoreId && store.IsActive))
        {
            return BadRequest("Store does not exist.");
        }

        moderator.Email = request.Email;
        moderator.PhoneNumber = request.PhoneNumber;
        moderator.AssignedStoreId = request.AssignedStoreId;
        moderator.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            moderator.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("moderators/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateModerator(int id)
    {
        var moderator = await _context.Users.FirstOrDefaultAsync(user => user.Id == id && user.Role == "Moderator");
        if (moderator == null) return NotFound();

        moderator.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotDto)
    {
        var normalizedEmail = NormalizeEmail(forgotDto.Email);
        if (normalizedEmail is null)
        {
            return BadRequest("Please enter a valid email address.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.Email != null && u.Email.ToLower() == normalizedEmail);
        if (user == null)
        {
            return NotFound("No account exists with this email.");
        }

        var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        ResetOtps[normalizedEmail] = new ResetOtpEntry(
            Otp: otp,
            UserId: user.Id,
            ExpiresAtUtc: DateTime.UtcNow.AddMinutes(10),
            Attempts: 0);

        return Ok(new
        {
            Message = "OTP generated. Enter it on the reset password page.",
            Email = user.Email,
            Otp = otp,
            ExpiresInMinutes = 10
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
    {
        if (string.IsNullOrWhiteSpace(resetDto.NewPassword) || resetDto.NewPassword.Length < 6)
        {
            return BadRequest("Password must be at least 6 characters.");
        }

        var normalizedEmail = NormalizeEmail(resetDto.Email);
        if (normalizedEmail is null)
        {
            return BadRequest("Please enter a valid email address.");
        }

        if (string.IsNullOrWhiteSpace(resetDto.Otp))
        {
            return BadRequest("Please enter the OTP.");
        }

        if (!ResetOtps.TryGetValue(normalizedEmail, out var resetOtp))
        {
            return BadRequest("No active reset OTP found for this email.");
        }

        if (resetOtp.ExpiresAtUtc < DateTime.UtcNow)
        {
            ResetOtps.TryRemove(normalizedEmail, out _);
            return BadRequest("OTP expired. Please request a new one.");
        }

        if (resetOtp.Attempts >= 5)
        {
            ResetOtps.TryRemove(normalizedEmail, out _);
            return BadRequest("Too many invalid attempts. Please request a new OTP.");
        }

        if (resetOtp.Otp != resetDto.Otp.Trim())
        {
            ResetOtps[normalizedEmail] = resetOtp with { Attempts = resetOtp.Attempts + 1 };
            return BadRequest("Invalid OTP.");
        }

        var user = await _context.Users.FindAsync(resetOtp.UserId);
        if (user == null || !string.Equals(user.Email, resetDto.Email?.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            ResetOtps.TryRemove(normalizedEmail, out _);
            return BadRequest("Invalid reset request.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetDto.NewPassword);
        await _context.SaveChangesAsync();
        ResetOtps.TryRemove(normalizedEmail, out _);

        return Ok(new { Message = "Password reset successful" });
    }

    private static string? NormalizeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        try
        {
            return new MailAddress(email.Trim()).Address.ToLowerInvariant();
        }
        catch (FormatException)
        {
            return null;
        }
    }

    private sealed record ResetOtpEntry(string Otp, int UserId, DateTime ExpiresAtUtc, int Attempts);
}
