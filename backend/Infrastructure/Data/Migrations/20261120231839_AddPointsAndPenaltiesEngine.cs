using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPointsAndPenaltiesEngine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PointRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Category = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Created_Utc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Created_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Updated_Utc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Updated_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PointRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PointTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RuleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Category = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SourceEventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SourceEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    TimestampUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RelatedTransactionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Created_Utc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Created_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Updated_Utc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Updated_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PointTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PointTransactions_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PointTransactions_PointRules_RuleId",
                        column: x => x.RuleId,
                        principalTable: "PointRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PointTransactions_PointTransactions_RelatedTransactionId",
                        column: x => x.RelatedTransactionId,
                        principalTable: "PointTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PointRules_Category",
                table: "PointRules",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_PointRules_EffectiveFrom",
                table: "PointRules",
                column: "EffectiveFrom");

            migrationBuilder.CreateIndex(
                name: "IX_PointRules_EventType",
                table: "PointRules",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_PointRules_IsActive",
                table: "PointRules",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PointRules_Name",
                table: "PointRules",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_Category",
                table: "PointTransactions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_Date",
                table: "PointTransactions",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_EmployeeId",
                table: "PointTransactions",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_EmployeeId_SourceEventId_RuleId",
                table: "PointTransactions",
                columns: new[] { "EmployeeId", "SourceEventId", "RuleId" });

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_EventType",
                table: "PointTransactions",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_RelatedTransactionId",
                table: "PointTransactions",
                column: "RelatedTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_RuleId",
                table: "PointTransactions",
                column: "RuleId");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_Status",
                table: "PointTransactions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_TimestampUtc",
                table: "PointTransactions",
                column: "TimestampUtc");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PointTransactions");

            migrationBuilder.DropTable(
                name: "PointRules");
        }
    }
}
