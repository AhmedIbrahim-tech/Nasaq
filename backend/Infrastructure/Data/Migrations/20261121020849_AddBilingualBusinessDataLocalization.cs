using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBilingualBusinessDataLocalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NameAr",
                table: "WorkShifts",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionAr",
                table: "WorkSchedules",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameAr",
                table: "WorkSchedules",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "WorkLocations",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddressAr",
                table: "WorkLocations",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameAr",
                table: "WorkLocations",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DepartmentAr",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullNameAr",
                table: "Users",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JobTitleAr",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionAr",
                table: "PointRules",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameAr",
                table: "PointRules",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionAr",
                table: "LeaveTypes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DepartmentAr",
                table: "Employees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstNameAr",
                table: "Employees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JobTitleAr",
                table: "Employees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastNameAr",
                table: "Employees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkShifts_NameAr",
                table: "WorkShifts",
                column: "NameAr");

            migrationBuilder.CreateIndex(
                name: "IX_WorkSchedules_NameAr",
                table: "WorkSchedules",
                column: "NameAr");

            migrationBuilder.CreateIndex(
                name: "IX_WorkLocations_NameAr",
                table: "WorkLocations",
                column: "NameAr");

            migrationBuilder.CreateIndex(
                name: "IX_PointRules_NameAr",
                table: "PointRules",
                column: "NameAr");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_FirstNameAr",
                table: "Employees",
                column: "FirstNameAr");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_LastNameAr",
                table: "Employees",
                column: "LastNameAr");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkShifts_NameAr",
                table: "WorkShifts");

            migrationBuilder.DropIndex(
                name: "IX_WorkSchedules_NameAr",
                table: "WorkSchedules");

            migrationBuilder.DropIndex(
                name: "IX_WorkLocations_NameAr",
                table: "WorkLocations");

            migrationBuilder.DropIndex(
                name: "IX_PointRules_NameAr",
                table: "PointRules");

            migrationBuilder.DropIndex(
                name: "IX_Employees_FirstNameAr",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_LastNameAr",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "NameAr",
                table: "WorkShifts");

            migrationBuilder.DropColumn(
                name: "DescriptionAr",
                table: "WorkSchedules");

            migrationBuilder.DropColumn(
                name: "NameAr",
                table: "WorkSchedules");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "WorkLocations");

            migrationBuilder.DropColumn(
                name: "AddressAr",
                table: "WorkLocations");

            migrationBuilder.DropColumn(
                name: "NameAr",
                table: "WorkLocations");

            migrationBuilder.DropColumn(
                name: "DepartmentAr",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FullNameAr",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "JobTitleAr",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DescriptionAr",
                table: "PointRules");

            migrationBuilder.DropColumn(
                name: "NameAr",
                table: "PointRules");

            migrationBuilder.DropColumn(
                name: "DescriptionAr",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "DepartmentAr",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "FirstNameAr",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "JobTitleAr",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "LastNameAr",
                table: "Employees");
        }
    }
}
