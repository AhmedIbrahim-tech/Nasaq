using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkLocationsAndGeofences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "WorkLocationId",
                table: "Employees",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WorkLocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    RadiusMeters = table.Column<double>(type: "float", nullable: false, defaultValue: 150.0),
                    AccuracyThresholdMeters = table.Column<double>(type: "float", nullable: false, defaultValue: 50.0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Created_Utc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Created_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Updated_Utc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Updated_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkLocations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_WorkLocationId",
                table: "Employees",
                column: "WorkLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkLocations_IsActive",
                table: "WorkLocations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_WorkLocations_Name",
                table: "WorkLocations",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_WorkLocations_WorkLocationId",
                table: "Employees",
                column: "WorkLocationId",
                principalTable: "WorkLocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_WorkLocations_WorkLocationId",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "WorkLocations");

            migrationBuilder.DropIndex(
                name: "IX_Employees_WorkLocationId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "WorkLocationId",
                table: "Employees");
        }
    }
}
