# Product Glossary — Sharm Photographer

> **Document Status:** Aligned & Consistent Baseline (Phase 0 Audit)  
> **System Purpose:** Internal Employee Attendance & Workforce Management System

Standardized terminology across domain models, API schemas, UI labels, and database schemas.

---

## 1. Domain Terminology

| English Term | مصطلح عربي | Definition / Scope | Status / Reference |
|---|---|---|---|
| **Worksite** | موقع العمل | The physical hotel, resort, or branch facility where employees are assigned to work. Defined by geo-coordinates and an authorized radius. | `EVIDENCE` / `MOD-03` |
| **Geofence** | النطاق الجغرافي | A circular virtual perimeter (radius in meters) surrounding a Worksite within which Check-in and Check-out are valid. Proposed default: 150m. | `PROPOSAL` / `DEC-009` OPEN |
| **GPS Accuracy Threshold** | حد دقة الموقع المقبولة | The radius of uncertainty (in meters) reported by the device geolocation hardware. Proposed default threshold: <= 50m. Readings exceeding threshold route to Pending Review (non-blocking). | `PROPOSAL` / `DEC-009` OPEN |
| **Check-in** | تسجيل الحضور (الدخول) | The atomic user action of registering daily arrival, capturing server time, device GPS coordinates, and evaluating against active schedule policy. | `APPROVED` / `DEC-002`, `DEC-005` |
| **Check-out** | تسجيل الانصراف (الخروج) | The atomic user action of registering shift departure, capturing server time, device GPS coordinates, and linking to active attendance record. | `APPROVED` / `DEC-002`, `DEC-005` |
| **CheckInStatus** | حالة عملية الحضور | Proposed operation-level lifecycle state: `not_checked_in`, `checked_in_verified`, `checked_in_pending_review`, `checked_in_rejected`. | `PROPOSAL` (Architectural Recommendation) |
| **CheckOutStatus** | حالة عملية الانصراف | Proposed operation-level lifecycle state: `not_checked_out`, `checked_out_verified`, `checked_out_pending_review`, `checked_out_rejected`. | `PROPOSAL` (Architectural Recommendation) |
| **AttendanceDayStatus** | الحالة الإجمالية للوردية | Proposed daily summary status aggregating both operation statuses without overwriting individual review states. | `PROPOSAL` (Architectural Recommendation) |
| **Incomplete Attendance Record** | سجل حضور غير مكتمل | An attendance record where the employee checked in, but no check-out event was recorded before the daily cutoff. Non-punitive baseline. | `PROPOSAL` / `DEC-018` OPEN |
| **Forgotten Check-out** | نسيان تسجيل الانصراف | Scenario where an employee departs without explicitly performing check-out. Flagged for administrative review without automated penalties. | `PROPOSAL` / `DEC-018` OPEN |
| **Early Departure** | انصراف مبكر | Checking out prior to the scheduled shift end time. Recorded as non-punitive metadata for reporting only. | `PROPOSAL` / `DEC-019` OPEN |
| **Shift Occurrence** | وردية العمل المجدولة | An individual scheduled workday instance for an employee at an assigned worksite on a specific date. | `EVIDENCE` / `MOD-04` |
| **Early Check-in** | حضور مبكر | Checking in during the configured Early window (Initial default: 07:00–08:00 AM). Grants +1 Green Point. | `APPROVED` / `DEC-003` |
| **Normal Check-in** | حضور في الموعد | Checking in during the configured Normal window (Initial default: 09:00–10:00 AM). Marks attendance On-Time (0 points). | `APPROVED` / `DEC-003` |
| **Late Check-in** | حضور متأخر | Checking in during the configured Late window (Initial default: 10:00–11:00 AM). Generates 1 Red penalty. | `APPROVED` / `DEC-003` |
| **Configurable Interval** | فترة زمنية قابلة للضبط | Shift time intervals (Initial defaults: 08:00–09:00 and 11:00–12:00) whose classification is left unset and determined by Admin/Manager per worksite. | `APPROVED` / `DEC-003`, `DEC-022` OPEN |
| **Attendance Cutoff** | موعد إغلاق الحضور القياسي | Configurable cutoff time (Initial default: 12:00 PM). Check-ins between cutoff and shift end mark the employee Present and assign a Black Card. | `APPROVED` / `DEC-003`, `DEC-004` |
| **Black Card** | بطاقة سوداء (علامة تأخير حاد) | **Disciplinary punctuality marker** assigned when an employee checks in between Cutoff and Shift End. **The employee is PRESENT, not absent.** Does NOT automatically mean an unexcused absence or financial deduction, and is NOT automatically redeemable via 5 Green points. | `APPROVED` / `DEC-004` |
| **Black Penalty** | جزاء أسود (جزاء غياب غير مبرر) | **Disciplinary penalty strike** associated with an unexcused absence (`absent_penalized`). Associated in demo video with 5 Green points redemption and nominal 1,000 EGP example. Financial/disciplinary binding nature remains OPEN. | `EVIDENCE` / `DEC-011`, `DEC-012` OPEN |
| **Shift End Time** | نهاية الوردية المقررة | Configurable operational shift departure time. Self-service check-in is permanently closed after this time; subsequent requests require admin review. | `APPROVED` / `DEC-004` |
| **Pending Review (Attendance)** | قيد المراجعة الإدارية | Holding state applied when Check-in or Check-out is submitted with GPS disabled, inaccurate, or outside geofence. Zero points/penalties apply while pending. | `APPROVED` / `DEC-006`, `DEC-007` |
| **Retroactive Evaluation** | تقييم بالتوقيت الأصلي | Evaluating an approved pending Check-in using its original submission timestamp against the active policy. Check-out approval does NOT generate arrival points. | `APPROVED` / `DEC-007`, `DEC-021` OPEN |
| **Green Point** | نقطة خضراء | Positive operational currency awarded for early attendance or exemplary performance. Used to offset eligible penalties or claim cash rewards. Consumption model remains OPEN. | `EVIDENCE` / `DEC-013` OPEN |
| **Red Penalty** | جزاء أحمر | Disciplinary strike caused by late arrival. Can be eliminated with 1 Green Point. Financial binding deduction value remains OPEN. | `EVIDENCE` / `DEC-012` OPEN |
| **Point Transaction (Ledger)** | قيد حركة النقاط | An immutable double-entry ledger record logging every addition, deduction, redemption, or reversal of points with actor, reason, and timestamp. | `PROPOSAL` / `MOD-06` |
| **Redemption** | استبدال / تسوية | Consuming Green Points to clear eligible penalties (1 Green for 1 Red; 5 Green for 1 Black Penalty) or claim rewards. Consumption model remains OPEN. | `EVIDENCE` / `DEC-013` OPEN |
| **Reversal (Adjustment)** | قيد عكسي / تصحيحي | An accounting transaction negating a previous penalty or point allocation without deleting historical records. | `PROPOSAL` / `MOD-12` |
| **Leave Request** | طلب إجازة | A formal employee request specifying absence dates and reason, awaiting managerial approval. | `EVIDENCE` / `MOD-07` |
| **Excused Leave** | إجازة معتمدة | An approved leave that automatically suppresses unexcused absence penalties for covered shift dates. Retrospective reversal policy remains OPEN. | `APPROVED` / `DEC-016` OPEN |
| **Reward Milestone** | هدف المكافأة | Target balance (30 Green Points in video) required to unlock a cash payout claim. Payout currency and reset cycle remain OPEN. | `EVIDENCE` / `DEC-014`, `DEC-015` OPEN |
| **Policy Version** | إصدار السياسة | An immutable, versioned snapshot of work hours, geofence rules, and classifications applied to specific shift occurrences. | `PROPOSAL` / `MOD-04` |
| **Audit Trail** | سجل التدقيق والرقابة | Append-only system log capturing all administrative modifications, overrides, exception decisions, and critical security events. | `APPROVED` / `MOD-12` |
