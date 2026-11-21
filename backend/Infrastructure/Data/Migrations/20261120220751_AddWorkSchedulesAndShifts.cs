using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkSchedulesAndShifts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Created_Utc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Created_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Updated_Utc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Updated_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkSchedules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkShifts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    IsOvernight = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EarlyStartTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    OnTimeStartTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    LateStartTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    CutoffTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Created_Utc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Created_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Updated_Utc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Updated_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkShifts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeScheduleAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkScheduleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Created_Utc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Created_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Updated_Utc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Updated_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeScheduleAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeScheduleAssignments_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeScheduleAssignments_WorkSchedules_WorkScheduleId",
                        column: x => x.WorkScheduleId,
                        principalTable: "WorkSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkScheduleDays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkScheduleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    IsWorkingDay = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    WorkShiftId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkScheduleDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkScheduleDays_WorkSchedules_WorkScheduleId",
                        column: x => x.WorkScheduleId,
                        principalTable: "WorkSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkScheduleDays_WorkShifts_WorkShiftId",
                        column: x => x.WorkShiftId,
                        principalTable: "WorkShifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeScheduleAssignments_EffectiveFrom",
                table: "EmployeeScheduleAssignments",
                column: "EffectiveFrom");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeScheduleAssignments_EmployeeId",
                table: "EmployeeScheduleAssignments",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeScheduleAssignments_IsActive",
                table: "EmployeeScheduleAssignments",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeScheduleAssignments_WorkScheduleId",
                table: "EmployeeScheduleAssignments",
                column: "WorkScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkScheduleDays_WorkScheduleId_DayOfWeek",
                table: "WorkScheduleDays",
                columns: new[] { "WorkScheduleId", "DayOfWeek" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkScheduleDays_WorkShiftId",
                table: "WorkScheduleDays",
                column: "WorkShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkSchedules_IsActive",
                table: "WorkSchedules",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_WorkSchedules_IsDefault",
                table: "WorkSchedules",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_WorkSchedules_Name",
                table: "WorkSchedules",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_WorkShifts_IsActive",
                table: "WorkShifts",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_WorkShifts_Name",
                table: "WorkShifts",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmployeeScheduleAssignments");

            migrationBuilder.DropTable(
                name: "WorkScheduleDays");

            migrationBuilder.DropTable(
                name: "WorkSchedules");

            migrationBuilder.DropTable(
                name: "WorkShifts");
        }
    }
}
