using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ShopApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Category = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Favorites_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "ImageUrl", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "Winter", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5631), "Trendy streetwear hoodie floating in mid-air.", "assets/images/premium_3d_hoodie.png", "Premium 3D Hoodie", 120.00m },
                    { 2, "Summer", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5902), "A pair of premium, futuristic trendy sneakers.", "assets/images/premium_3d_sneakers.png", "Futuristic Sneakers", 250.00m },
                    { 3, "Winter", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5905), "Premium, stylish modern jacket or puffer coat.", "assets/images/premium_3d_jacket.png", "Modern Puffer Jacket", 340.00m },
                    { 4, "Summer", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5907), "Lightweight vintage-style summer shirt.", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800", "Summer Vintage Shirt", 65.00m },
                    { 5, "Summer", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5909), "Premium streetwear cargo shorts.", "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800", "Cargo Shorts", 90.00m },
                    { 6, "Summer", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5911), "Trendy summer bucket hat.", "https://images.unsplash.com/photo-1521369909029-2afed882ba54?q=80&w=800", "Streetwear Bucket Hat", 45.00m },
                    { 7, "Winter", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5913), "Warm winter knit beanie cap.", "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800", "Winter Knit Beanie", 35.00m },
                    { 8, "Winter", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5915), "Heavy duty tactical winter boots.", "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800", "Tactical Winter Boots", 210.00m },
                    { 9, "Winter", new DateTime(2026, 4, 17, 1, 0, 52, 88, DateTimeKind.Utc).AddTicks(5917), "Premium soft designer scarf.", "https://images.unsplash.com/photo-1601379430166-70eeb04e2808?q=80&w=800", "Designer Scarf", 110.00m }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "PasswordHash", "PhoneNumber", "Username" },
                values: new object[] { 1, null, "$2a$11$iuYObo/d.Y9bsG1yuSfacOSPA/qZ9ExnMntvGXosYtPxS/8wzZEJi", null, "admin" });

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_ProductId",
                table: "CartItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_ProductId",
                table: "Favorites",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
