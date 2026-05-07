using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DiscoverDish.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RestaurantId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RestaurantId",
                table: "Users",
                column: "RestaurantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Restaurants_RestaurantId",
                table: "Users",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Restaurants_RestaurantId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_RestaurantId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Users");
        }
    }
}
