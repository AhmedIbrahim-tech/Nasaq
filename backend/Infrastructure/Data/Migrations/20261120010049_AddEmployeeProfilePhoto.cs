using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeProfilePhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProfilePhoto",
                table: "Employees",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ProfilePhoto",
                table: "Employees",
                column: "ProfilePhoto");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_StoredFiles_ProfilePhoto",
                table: "Employees",
                column: "ProfilePhoto",
                principalTable: "StoredFiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_StoredFiles_ProfilePhoto",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_ProfilePhoto",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "ProfilePhoto",
                table: "Employees");
        }
    }
}
