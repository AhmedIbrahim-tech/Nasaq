using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceEngine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AttendanceRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    WorkLocationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WorkShiftId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CheckInTimeUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckInLatitude = table.Column<double>(type: "float", nullable: true),
                    CheckInLongitude = table.Column<double>(type: "float", nullable: true),
                    CheckInAccuracyMeters = table.Column<double>(type: "float", nullable: true),
                    CheckInDistanceMeters = table.Column<double>(type: "float", nullable: true),
                    CheckInStatus = table.Column<int>(type: "int", nullable: false),
                    CheckInFailureReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ArrivalClassification = table.Column<int>(type: "int", nullable: false),
                    CheckOutTimeUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckOutLatitude = table.Column<double>(type: "float", nullable: true),
                    CheckOutLongitude = table.Column<double>(type: "float", nullable: true),
                    CheckOutAccuracyMeters = table.Column<double>(type: "float", nullable: true),
                    CheckOutDistanceMeters = table.Column<double>(type: "float", nullable: true),
                    CheckOutStatus = table.Column<int>(type: "int", nullable: false),
                    CheckOutFailureReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    CheckInDeviceInfo = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CheckOutDeviceInfo = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsManuallyAdjusted = table.Column<bool>(type: "bit", nullable: false),
                    ReviewNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReviewedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    ReviewedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Created_Utc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Created_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Updated_Utc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Updated_By = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_WorkLocations_WorkLocationId",
                        column: x => x.WorkLocationId,
                        principalTable: "WorkLocations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_WorkShifts_WorkShiftId",
                        column: x => x.WorkShiftId,
                        principalTable: "WorkShifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_CheckInTimeUtc",
                table: "AttendanceRecords",
                column: "CheckInTimeUtc");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_CheckOutTimeUtc",
                table: "AttendanceRecords",
                column: "CheckOutTimeUtc");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_Date",
                table: "AttendanceRecords",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EmployeeId",
                table: "AttendanceRecords",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EmployeeId_CheckOutTimeUtc",
                table: "AttendanceRecords",
                columns: new[] { "EmployeeId", "CheckOutTimeUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_Status",
                table: "AttendanceRecords",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_WorkLocationId",
                table: "AttendanceRecords",
                column: "WorkLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_WorkShiftId",
                table: "AttendanceRecords",
                column: "WorkShiftId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceRecords");
        }
    }
}
