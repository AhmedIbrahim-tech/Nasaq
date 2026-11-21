using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Data;

public static class DevDataSeeder
{
    public const string FixtureMarker = "DEV_FIXTURE";

    public static async Task SeedDevFixturesAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("[DevDataSeeder] Checking and applying safe development fixtures...");

        await SeedShiftsAndSchedulesAsync(context, logger);
        await SeedPointRulesAsync(context, logger);
        await SeedPointTransactionsAsync(context, logger);
        await SeedLeaveRequestsAsync(context, logger);
        await SeedAttendanceRecordsAsync(context, logger);

        logger.LogInformation("[DevDataSeeder] Development fixtures check completed.");
    }

    private static async Task SeedShiftsAndSchedulesAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.WorkShifts.AnyAsync(s => s.Notes == FixtureMarker))
        {
            return;
        }

        var morningShift = new WorkShift
        {
            Name = "Morning Shift (08:00 - 16:30)",
            NameAr = "الوردية الصباحية (08:00 - 16:30)",
            StartTime = new TimeOnly(8, 0),
            EndTime = new TimeOnly(16, 30),
            EarlyStartTime = new TimeOnly(7, 30),
            OnTimeStartTime = new TimeOnly(8, 15),
            LateStartTime = new TimeOnly(8, 45),
            CutoffTime = new TimeOnly(9, 30),
            IsOvernight = false,
            IsActive = true,
            Notes = FixtureMarker
        };

        var eveningShift = new WorkShift
        {
            Name = "Evening Shift (16:00 - 00:30)",
            NameAr = "الوردية المسائية (16:00 - 00:30)",
            StartTime = new TimeOnly(16, 0),
            EndTime = new TimeOnly(0, 30),
            EarlyStartTime = new TimeOnly(15, 30),
            OnTimeStartTime = new TimeOnly(16, 15),
            LateStartTime = new TimeOnly(16, 45),
            CutoffTime = new TimeOnly(17, 30),
            IsOvernight = true,
            IsActive = true,
            Notes = FixtureMarker
        };

        var nightShift = new WorkShift
        {
            Name = "Night Shift (00:00 - 08:30)",
            NameAr = "الوردية الليلية (00:00 - 08:30)",
            StartTime = new TimeOnly(0, 0),
            EndTime = new TimeOnly(8, 30),
            IsOvernight = false,
            IsActive = true,
            Notes = FixtureMarker
        };

        context.WorkShifts.AddRange(morningShift, eveningShift, nightShift);
        await context.SaveChangesAsync();

        // Create standard schedule
        var schedule = new WorkSchedule
        {
            Name = "Weekly Standard 5-Day Schedule",
            NameAr = "جدول العمل الأسبوعي القياسي (5 أيام)",
            Description = FixtureMarker,
            DescriptionAr = "أيام العمل من الأحد إلى الخميس مع راحة يومي الجمعة والسبت",
            IsDefault = true,
            IsActive = true
        };

        for (int day = 0; day <= 6; day++)
        {
            var isWork = day != (int)DayOfWeek.Friday && day != (int)DayOfWeek.Saturday;
            schedule.Days.Add(new WorkScheduleDay
            {
                DayOfWeek = (DayOfWeek)day,
                IsWorkingDay = isWork,
                WorkShiftId = isWork ? morningShift.Id : null
            });
        }

        context.WorkSchedules.Add(schedule);
        await context.SaveChangesAsync();

        // Assign schedule to employees
        var employees = await context.Employees
            .Where(e => e.EmployeeCode == "EMP-001" || e.EmployeeCode == "EMP-SUPER01")
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        foreach (var emp in employees)
        {
            if (!await context.EmployeeScheduleAssignments.AnyAsync(a => a.EmployeeId == emp.Id))
            {
                context.EmployeeScheduleAssignments.Add(new EmployeeScheduleAssignment
                {
                    EmployeeId = emp.Id,
                    WorkScheduleId = schedule.Id,
                    EffectiveFrom = today.AddDays(-30),
                    IsActive = true,
                    Notes = FixtureMarker
                });
            }
        }

        await context.SaveChangesAsync();
        logger.LogInformation("[DevDataSeeder] Seeded Shifts, Schedule, and Assignments.");
    }

    private static async Task SeedPointRulesAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.PointRules.AnyAsync(r => r.Description == FixtureMarker))
        {
            return;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var rules = new List<PointRule>
        {
            new()
            {
                Name = "On-Time Arrival",
                NameAr = "حضور في الموعد المحدد",
                Category = PointCategory.Green,
                EventType = PointEventType.OnTimeArrival,
                Points = 1,
                EffectiveFrom = today.AddDays(-90),
                Description = FixtureMarker,
                DescriptionAr = "منح نقطة أداء خضراء للحضور في نافذة الدخول المعتمدة",
                IsActive = true
            },
            new()
            {
                Name = "Early Arrival Incentive",
                NameAr = "مكافأة الحضور المبكر",
                Category = PointCategory.Green,
                EventType = PointEventType.EarlyArrival,
                Points = 2,
                EffectiveFrom = today.AddDays(-90),
                Description = FixtureMarker,
                DescriptionAr = "مكافأة الحضور المبكر قبل بدء الوردية",
                IsActive = true
            },
            new()
            {
                Name = "Shift Completion",
                NameAr = "إتمام الوردية كاملة",
                Category = PointCategory.Green,
                EventType = PointEventType.CompletedShift,
                Points = 1,
                EffectiveFrom = today.AddDays(-90),
                Description = FixtureMarker,
                DescriptionAr = "مكافأة إتمام كامل ساعات العمل المقررة",
                IsActive = true
            },
            new()
            {
                Name = "Late Arrival (15-30m)",
                NameAr = "تأخير خفيف (15-30 دقيقة)",
                Category = PointCategory.Red,
                EventType = PointEventType.LateArrival,
                Points = -2,
                EffectiveFrom = today.AddDays(-90),
                Description = FixtureMarker,
                DescriptionAr = "خصم نقطتين انضباطيتين للتأخير عن الموعد",
                IsActive = true
            },
            new()
            {
                Name = "After Cutoff Arrival",
                NameAr = "تأخير تجاوز حد الانقطاع",
                Category = PointCategory.Red,
                EventType = PointEventType.AfterCutoffArrival,
                Points = -5,
                EffectiveFrom = today.AddDays(-90),
                Description = FixtureMarker,
                DescriptionAr = "خصم خمس نقاط للتأخير الشديد بعد حد الانقطاع",
                IsActive = true
            },
            new()
            {
                Name = "Geofence Breach",
                NameAr = "مخالفة النطاق الجغرافي",
                Category = PointCategory.Red,
                EventType = PointEventType.GeofenceBreach,
                Points = -5,
                EffectiveFrom = today.AddDays(-90),
                Description = FixtureMarker,
                DescriptionAr = "خصم 5 نقاط للتسجيل خارج موقع العمل المعتمد",
                IsActive = true
            },
            new()
            {
                Name = "Missing Check-Out",
                NameAr = "عدم تسجيل الانصراف",
                Category = PointCategory.Red,
                EventType = PointEventType.MissingCheckOut,
                Points = -3,
                EffectiveFrom = today.AddDays(-90),
                Description = FixtureMarker,
                DescriptionAr = "خصم 3 نقاط في حال مغادرة العمل بدون تسجيل انصراف",
                IsActive = true
            }
        };

        context.PointRules.AddRange(rules);
        await context.SaveChangesAsync();
        logger.LogInformation("[DevDataSeeder] Seeded {Count} Point Rules.", rules.Count);
    }

    private static async Task SeedPointTransactionsAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.PointTransactions.AnyAsync(t => t.SourceEventType == FixtureMarker))
        {
            return;
        }

        var employees = await context.Employees
            .Where(e => e.EmployeeCode == "EMP-001" || e.EmployeeCode == "EMP-SUPER01")
            .ToListAsync();

        if (employees.Count == 0) return;

        var onTimeRule = await context.PointRules.FirstOrDefaultAsync(r => r.EventType == PointEventType.OnTimeArrival);
        var earlyRule = await context.PointRules.FirstOrDefaultAsync(r => r.EventType == PointEventType.EarlyArrival);
        var lateRule = await context.PointRules.FirstOrDefaultAsync(r => r.EventType == PointEventType.LateArrival);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var transactions = new List<PointTransaction>();
        foreach (var emp in employees)
        {
            // 1. On time (+1 Green, Finalized)
            transactions.Add(new PointTransaction
            {
                EmployeeId = emp.Id,
                RuleId = onTimeRule?.Id,
                Category = PointCategory.Green,
                EventType = PointEventType.OnTimeArrival,
                Points = 1,
                Status = PointTransactionStatus.Finalized,
                Date = today.AddDays(-3),
                TimestampUtc = DateTime.UtcNow.AddDays(-3),
                Reason = "DEV_FIXTURE: حضور نظامي في الموعد",
                SourceEventType = FixtureMarker
            });

            // 2. Early arrival (+2 Green, Finalized)
            transactions.Add(new PointTransaction
            {
                EmployeeId = emp.Id,
                RuleId = earlyRule?.Id,
                Category = PointCategory.Green,
                EventType = PointEventType.EarlyArrival,
                Points = 2,
                Status = PointTransactionStatus.Finalized,
                Date = today.AddDays(-2),
                TimestampUtc = DateTime.UtcNow.AddDays(-2),
                Reason = "DEV_FIXTURE: حضور مبكر قبل بدء الوردية",
                SourceEventType = FixtureMarker
            });

            // 3. Late arrival (-2 Red, Finalized)
            transactions.Add(new PointTransaction
            {
                EmployeeId = emp.Id,
                RuleId = lateRule?.Id,
                Category = PointCategory.Red,
                EventType = PointEventType.LateArrival,
                Points = -2,
                Status = PointTransactionStatus.Finalized,
                Date = today.AddDays(-1),
                TimestampUtc = DateTime.UtcNow.AddDays(-1),
                Reason = "DEV_FIXTURE: تأخير 22 دقيقة عن بدء الوردية",
                SourceEventType = FixtureMarker
            });

            // 4. Authorized manual adjustment (+5 Green, Finalized)
            transactions.Add(new PointTransaction
            {
                EmployeeId = emp.Id,
                Category = PointCategory.Green,
                EventType = PointEventType.ManualAdjustment,
                Points = 5,
                Status = PointTransactionStatus.Finalized,
                Date = today,
                TimestampUtc = DateTime.UtcNow.AddHours(-2),
                Reason = "DEV_FIXTURE: مكافأة تميز في التغطية الميدانية",
                SourceEventType = FixtureMarker
            });

            // 5. Geofence exception Pending Review (-5 Red, PendingReview)
            transactions.Add(new PointTransaction
            {
                EmployeeId = emp.Id,
                Category = PointCategory.Red,
                EventType = PointEventType.GeofenceBreach,
                Points = -5,
                Status = PointTransactionStatus.PendingReview,
                Date = today,
                TimestampUtc = DateTime.UtcNow.AddHours(-1),
                Reason = "DEV_FIXTURE: قيد مراجعة استثناء الموقع الجغرافي",
                SourceEventType = FixtureMarker
            });

            // 6. Reversible & Reversed transaction
            var originalTx = new PointTransaction
            {
                EmployeeId = emp.Id,
                Category = PointCategory.Red,
                EventType = PointEventType.LateArrival,
                Points = -2,
                Status = PointTransactionStatus.Reversed,
                Date = today.AddDays(-5),
                TimestampUtc = DateTime.UtcNow.AddDays(-5),
                Reason = "DEV_FIXTURE: خصم تأخير تم إلغاؤه بعذر مقبول",
                SourceEventType = FixtureMarker
            };
            transactions.Add(originalTx);

            var reversalTx = new PointTransaction
            {
                EmployeeId = emp.Id,
                Category = PointCategory.Green,
                EventType = PointEventType.ManualAdjustment,
                Points = 2,
                Status = PointTransactionStatus.Finalized,
                Date = today.AddDays(-4),
                TimestampUtc = DateTime.UtcNow.AddDays(-4),
                Reason = "DEV_FIXTURE: تسوية عكسية للخصم الخاطئ",
                SourceEventType = FixtureMarker,
                RelatedTransactionId = originalTx.Id
            };
            transactions.Add(reversalTx);
        }

        context.PointTransactions.AddRange(transactions);
        await context.SaveChangesAsync();
        logger.LogInformation("[DevDataSeeder] Seeded {Count} Point Transactions.", transactions.Count);
    }

    private static async Task SeedLeaveRequestsAsync(ApplicationDbContext context, ILogger logger)
    {
        var annualType = await context.LeaveTypes.FirstOrDefaultAsync(t => t.Code == "ANNUAL");
        var sickType = await context.LeaveTypes.FirstOrDefaultAsync(t => t.Code == "SICK");
        var emergencyType = await context.LeaveTypes.FirstOrDefaultAsync(t => t.Code == "EMERGENCY");
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var superEmp = await context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-SUPER01");
        if (superEmp != null && !await context.LeaveRequests.AnyAsync(l => l.EmployeeId == superEmp.Id && l.Reason != null && l.Reason.StartsWith(FixtureMarker)))
        {
            if (annualType != null && emergencyType != null)
            {
                var superApproved = new LeaveRequest
                {
                    EmployeeId = superEmp.Id,
                    LeaveTypeId = annualType.Id,
                    StartDate = today.AddDays(10),
                    EndDate = today.AddDays(14),
                    DaysCount = 5,
                    Reason = $"{FixtureMarker}: إجازة سنوية مجدولة",
                    Status = LeaveRequestStatus.Approved,
                    SubmittedAtUtc = DateTime.UtcNow.AddDays(-3),
                    ReviewedAtUtc = DateTime.UtcNow.AddDays(-2),
                    ReviewedBy = "Management",
                    ReviewNotes = "معتمد"
                };
                superApproved.ApprovalHistory.Add(new LeaveApprovalHistory
                {
                    LeaveRequestId = superApproved.Id,
                    Action = LeaveApprovalAction.Submitted,
                    ActionDateUtc = DateTime.UtcNow.AddDays(-3),
                    ActorName = "System SuperAdmin",
                    Comments = "طلب إجازة سنوية"
                });
                superApproved.ApprovalHistory.Add(new LeaveApprovalHistory
                {
                    LeaveRequestId = superApproved.Id,
                    Action = LeaveApprovalAction.Approved,
                    ActionDateUtc = DateTime.UtcNow.AddDays(-2),
                    ActorName = "Management",
                    Comments = "معتمد"
                });
                context.LeaveRequests.Add(superApproved);

                var superPending = new LeaveRequest
                {
                    EmployeeId = superEmp.Id,
                    LeaveTypeId = emergencyType.Id,
                    StartDate = today.AddDays(3),
                    EndDate = today.AddDays(3),
                    DaysCount = 1,
                    Reason = $"{FixtureMarker}: ظرف طارئ عائلي",
                    Status = LeaveRequestStatus.Pending,
                    SubmittedAtUtc = DateTime.UtcNow.AddHours(-4)
                };
                superPending.ApprovalHistory.Add(new LeaveApprovalHistory
                {
                    LeaveRequestId = superPending.Id,
                    Action = LeaveApprovalAction.Submitted,
                    ActionDateUtc = DateTime.UtcNow.AddHours(-4),
                    ActorName = "System SuperAdmin",
                    Comments = "قيد المراجعة"
                });
                context.LeaveRequests.Add(superPending);
                await context.SaveChangesAsync();
                logger.LogInformation("[DevDataSeeder] Seeded 2 SuperAdmin Leave Requests.");
            }
        }

        if (await context.LeaveRequests.AnyAsync(l => l.Reason != null && l.Reason.StartsWith(FixtureMarker)))
        {
            return;
        }

        var emp1 = await context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-001");
        var emp2 = await context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-002");

        var requests = new List<LeaveRequest>();

        if (emp1 != null && annualType != null && sickType != null)
        {
            // 1. Approved Annual Leave (3 days)
            var approved = new LeaveRequest
            {
                EmployeeId = emp1.Id,
                LeaveTypeId = annualType.Id,
                StartDate = today.AddDays(7),
                EndDate = today.AddDays(9),
                DaysCount = 3,
                Reason = $"{FixtureMarker}: إجازة سنوية عائلية مخططة مسبقاً",
                Status = LeaveRequestStatus.Approved,
                SubmittedAtUtc = DateTime.UtcNow.AddDays(-2),
                ReviewedAtUtc = DateTime.UtcNow.AddDays(-1),
                ReviewedBy = "Ahmad Supervisor",
                ReviewNotes = "معتمد بناءً على رصيد الإجازات المتاح وتنسيق التغطية"
            };
            approved.ApprovalHistory.Add(new LeaveApprovalHistory
            {
                LeaveRequestId = approved.Id,
                Action = LeaveApprovalAction.Submitted,
                ActionDateUtc = DateTime.UtcNow.AddDays(-2),
                ActorName = "Mohamed Photographer",
                Comments = "طلب إجازة سنوية"
            });
            approved.ApprovalHistory.Add(new LeaveApprovalHistory
            {
                LeaveRequestId = approved.Id,
                Action = LeaveApprovalAction.Approved,
                ActionDateUtc = DateTime.UtcNow.AddDays(-1),
                ActorName = "Ahmad Supervisor",
                Comments = "معتمد"
            });
            requests.Add(approved);

            // 2. Pending Sick Leave (2 days)
            var pending = new LeaveRequest
            {
                EmployeeId = emp1.Id,
                LeaveTypeId = sickType.Id,
                StartDate = today.AddDays(1),
                EndDate = today.AddDays(2),
                DaysCount = 2,
                Reason = $"{FixtureMarker}: إجازة مرضية لظرف صحي ومراجعة طبية",
                Status = LeaveRequestStatus.Pending,
                SubmittedAtUtc = DateTime.UtcNow.AddHours(-3)
            };
            pending.ApprovalHistory.Add(new LeaveApprovalHistory
            {
                LeaveRequestId = pending.Id,
                Action = LeaveApprovalAction.Submitted,
                ActionDateUtc = DateTime.UtcNow.AddHours(-3),
                ActorName = "Mohamed Photographer",
                Comments = "بانتظار مراجعة التقرير الطبي والاعتماد"
            });
            requests.Add(pending);
        }

        if (emp2 != null && emergencyType != null)
        {
            // 3. Rejected Emergency Leave (1 day)
            var rejected = new LeaveRequest
            {
                EmployeeId = emp2.Id,
                LeaveTypeId = emergencyType.Id,
                StartDate = today.AddDays(-4),
                EndDate = today.AddDays(-4),
                DaysCount = 1,
                Reason = $"{FixtureMarker}: طلب إجازة اضطرارية",
                Status = LeaveRequestStatus.Rejected,
                SubmittedAtUtc = DateTime.UtcNow.AddDays(-5),
                ReviewedAtUtc = DateTime.UtcNow.AddDays(-4),
                ReviewedBy = "Operations Administrator",
                ReviewNotes = "تعذر القبول لتعارض مع مواعيد التغطية الميدانية الإلزامية"
            };
            rejected.ApprovalHistory.Add(new LeaveApprovalHistory
            {
                LeaveRequestId = rejected.Id,
                Action = LeaveApprovalAction.Rejected,
                ActionDateUtc = DateTime.UtcNow.AddDays(-4),
                ActorName = "Operations Administrator",
                Comments = "مرفوض"
            });
            requests.Add(rejected);

            // 4. Cancelled Annual Leave
            if (annualType != null)
            {
                var cancelled = new LeaveRequest
                {
                    EmployeeId = emp2.Id,
                    LeaveTypeId = annualType.Id,
                    StartDate = today.AddDays(14),
                    EndDate = today.AddDays(16),
                    DaysCount = 3,
                    Reason = $"{FixtureMarker}: تم إلغاء الطلب لتغير خطة السفر",
                    Status = LeaveRequestStatus.Cancelled,
                    SubmittedAtUtc = DateTime.UtcNow.AddDays(-7),
                    ReviewedAtUtc = DateTime.UtcNow.AddDays(-6),
                    ReviewedBy = emp2.FullName,
                    ReviewNotes = "ألغي من قبل الموظف"
                };
                requests.Add(cancelled);
            }
        }

        context.LeaveRequests.AddRange(requests);
        await context.SaveChangesAsync();
        logger.LogInformation("[DevDataSeeder] Seeded {Count} Leave Requests.", requests.Count);
    }

    private static async Task SeedAttendanceRecordsAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.AttendanceRecords.AnyAsync(a => a.Notes == FixtureMarker))
        {
            return;
        }

        var emp1 = await context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-001");
        var emp2 = await context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-002");
        var superEmp = await context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == "EMP-SUPER01");
        var hq = await context.WorkLocations.FirstOrDefaultAsync(l => l.Name.Contains("Riyadh"));
        var shift = await context.WorkShifts.FirstOrDefaultAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);
        var records = new List<AttendanceRecord>();

        // 1. Incomplete Attendance (Checked in yesterday morning, missing check-out!) -> For Incomplete Attendance Table
        if (emp1 != null)
        {
            var checkInYesterday = yesterday.ToDateTime(new TimeOnly(8, 2, 0), DateTimeKind.Utc);
            records.Add(new AttendanceRecord
            {
                EmployeeId = emp1.Id,
                Date = yesterday,
                WorkLocationId = hq?.Id,
                WorkShiftId = shift?.Id,
                CheckInTimeUtc = checkInYesterday,
                CheckInLatitude = hq?.Latitude ?? 24.7136,
                CheckInLongitude = hq?.Longitude ?? 46.6753,
                CheckInAccuracyMeters = 15.0,
                CheckInDistanceMeters = 12.0,
                CheckInStatus = VerificationStatus.Verified,
                ArrivalClassification = ArrivalClassification.Standard,
                CheckOutTimeUtc = null,
                CheckOutStatus = VerificationStatus.NotRecorded,
                Status = AttendanceStatus.Present,
                DurationMinutes = null,
                Notes = FixtureMarker
            });
        }

        // 2. GPS Exception Check-in Pending Review (Low Accuracy: 209m > 50m) -> For GPS Exceptions Queue
        if (emp2 != null)
        {
            var checkInToday = today.ToDateTime(new TimeOnly(8, 10, 0), DateTimeKind.Utc);
            records.Add(new AttendanceRecord
            {
                EmployeeId = emp2.Id,
                Date = today,
                WorkLocationId = hq?.Id,
                WorkShiftId = shift?.Id,
                CheckInTimeUtc = checkInToday,
                CheckInLatitude = hq?.Latitude ?? 24.7136,
                CheckInLongitude = hq?.Longitude ?? 46.6753,
                CheckInAccuracyMeters = 209.0,
                CheckInDistanceMeters = 24.0,
                CheckInStatus = VerificationStatus.PendingReview,
                CheckInFailureReason = "low_accuracy: device reported 209m, threshold is 50m",
                ArrivalClassification = ArrivalClassification.Standard,
                CheckOutTimeUtc = null,
                CheckOutStatus = VerificationStatus.NotRecorded,
                Status = AttendanceStatus.PendingReview,
                DurationMinutes = null,
                Notes = FixtureMarker
            });
        }

        // 3. GPS Exception Check-out Pending Review (Outside Geofence: 320m > 200m) -> For GPS Exceptions Queue
        if (superEmp != null)
        {
            var checkInTwoDaysAgo = today.AddDays(-2).ToDateTime(new TimeOnly(8, 0, 0), DateTimeKind.Utc);
            var checkOutTwoDaysAgo = today.AddDays(-2).ToDateTime(new TimeOnly(16, 30, 0), DateTimeKind.Utc);
            records.Add(new AttendanceRecord
            {
                EmployeeId = superEmp.Id,
                Date = today.AddDays(-2),
                WorkLocationId = hq?.Id,
                WorkShiftId = shift?.Id,
                CheckInTimeUtc = checkInTwoDaysAgo,
                CheckInLatitude = hq?.Latitude ?? 24.7136,
                CheckInLongitude = hq?.Longitude ?? 46.6753,
                CheckInAccuracyMeters = 10.0,
                CheckInDistanceMeters = 15.0,
                CheckInStatus = VerificationStatus.Verified,
                ArrivalClassification = ArrivalClassification.Standard,
                CheckOutTimeUtc = checkOutTwoDaysAgo,
                CheckOutLatitude = (hq?.Latitude ?? 24.7136) + 0.003,
                CheckOutLongitude = (hq?.Longitude ?? 46.6753) + 0.003,
                CheckOutAccuracyMeters = 12.0,
                CheckOutDistanceMeters = 320.0,
                CheckOutStatus = VerificationStatus.PendingReview,
                CheckOutFailureReason = "outside_geofence_checkout: 320m (radius is 200m)",
                Status = AttendanceStatus.PendingReview,
                DurationMinutes = 510,
                Notes = FixtureMarker
            });
        }

        // 4. Completed normal attendance record for today
        if (emp1 != null)
        {
            var checkInToday = today.ToDateTime(new TimeOnly(7, 55, 0), DateTimeKind.Utc);
            var checkOutToday = today.ToDateTime(new TimeOnly(16, 25, 0), DateTimeKind.Utc);
            records.Add(new AttendanceRecord
            {
                EmployeeId = emp1.Id,
                Date = today,
                WorkLocationId = hq?.Id,
                WorkShiftId = shift?.Id,
                CheckInTimeUtc = checkInToday,
                CheckInLatitude = hq?.Latitude ?? 24.7136,
                CheckInLongitude = hq?.Longitude ?? 46.6753,
                CheckInAccuracyMeters = 10.0,
                CheckInDistanceMeters = 12.0,
                CheckInStatus = VerificationStatus.Verified,
                ArrivalClassification = ArrivalClassification.Early,
                CheckOutTimeUtc = checkOutToday,
                CheckOutLatitude = hq?.Latitude ?? 24.7136,
                CheckOutLongitude = hq?.Longitude ?? 46.6753,
                CheckOutAccuracyMeters = 10.0,
                CheckOutDistanceMeters = 15.0,
                CheckOutStatus = VerificationStatus.Verified,
                Status = AttendanceStatus.Completed,
                DurationMinutes = 510,
                Notes = FixtureMarker
            });
        }

        context.AttendanceRecords.AddRange(records);
        await context.SaveChangesAsync();
        logger.LogInformation("[DevDataSeeder] Seeded {Count} Attendance Records.", records.Count);
    }
}
