# Video Evidence Ledger — Sharm Photographer (Download.mp4)

> **Source Video:** `Download.mp4` (~109.6 seconds / 01:49)  
> **Confidence Notation:**
> - `[V]` **Verified:** Directly visible on screen, legible text, or measurable UI element with timestamp.
> - `[I]` **Inference:** Logical engineering/domain deduction derived from visible elements.
> - `[P]` **Proposal:** Architectural, UX, or technical recommendation requiring business alignment.
> - `[Q]` **Open Question:** Ambiguity, missing parameter, or unverified rule requiring formal decision.
> - `[D]` **Decision Approved:** Formally approved by project owner.

---

## 1. Frame-by-Frame Evidence Matrix

| Timecode | Visible Visual Element | Engineering Classification & Evidence Interpretation | Confidence |
|---|---|---|---|
| **00:00** | Intro Infographic: GPS pin, Check-in clock, Green/Red/Black points, Leave request, Cash reward badge, Admin gear. | High-level summary of core application domains. | `[V]` |
| **00:06–00:09** | Staff Login screen & "Check In & Points" employee dashboard card. | Mobile-first authentication screen and home landing view. | `[V]` |
| **00:11–00:14** | Map interface with radar scan circle and green status badge: "Location Verified". | Pre-check-in geofence radius validation against assigned coordinates. | `[V]` |
| **00:15–00:21** | Admin configuration cards: "Normal: 09:00 - 10:00" and "Late: 10:00 - 11:00". | Attendance classification time windows configured by administrative role. | `[V]` |
| **00:23–00:26** | Penalty card showing "Red penalties" and "Monthly Attendance Deductions: 1 × 250 EGP = 250 EGP". | Late arrival triggers a Red penalty; 1 Red is priced at 250 EGP. | `[V]` |
| **00:29–00:31** | Shift card showing "Early Check-in: 07:00 - 08:00" and "+1 Green Point" reward. | Punctual early arrival awards positive Green currency. | `[V]` |
| **00:33–00:36** | Interactive action: "Remove -1" button on Red Late penalty card consuming Green point. | Employees can actively redeem 1 Green Point to erase 1 Red penalty. | `[V]` |
| **00:39–00:42** | Gamified milestone progress: "Green Reward Progress 0/30" progressing to "30" with active "Send Reward Request" CTA. | Reaching exactly 30 Green Points unlocks an incentive redemption flow. | `[V]` |
| **00:45–00:51** | Reward modal showing payout methods: `InstaPay` / `Vodafone Cash`, phone field, and payout text: "30 Green ≈ $40 ≈ 2,200 EGP". | Cash conversion mechanism with Egyptian payment channels and dollar parity. | `[V]` |
| **00:54–00:59** | System lock screen at 12:00 PM displaying: "Close 12:00 PM - Check-in unavailable". | Daily attendance window strictly closes at 12:00 PM; late check-in blocked thereafter. | `[V]` |
| **01:00–01:03** | Absence screen displaying "Black absence" and breakdown formula: `Black: 1 × 1,000 EGP = 0 EGP`. | Failure to check in results in Black point. Paradox: 1 × 1000 calculates as 0 EGP total. | `[V]` + `[Q]` |
| **01:06–01:09** | Rules list: Recurring work days and offset formula: "Remove 5 Green Points to remove 1 Black Penalty". | Conversion rate for severe unexcused absence is fixed at 5:1 Green-to-Black. | `[V]` |
| **01:12–01:21** | Admin modal: "Add/Enter Points" with Point Type selector, Quantity, Reason text field, and "Apply Points" button. | Manual administrative point adjustments are supported with mandatory rationale. | `[V]` |
| **01:24–01:30** | Employee screen: "Request Leave" date picker; Admin view: "Pending Leave Requests" with "Approve" and "Cancel" buttons. | Formal digital leave submission and two-way administrative decision workflow. | `[V]` |
| **01:33–01:39** | Admin view: "All Leave Requests" showing "Approved Leave → No Absence Penalty". | An approved leave formally excuses the employee and suppresses Black absence generation. | `[V]` |
| **01:39–01:40** | Tabular data grid: Columns for Employee Name, Check-in Time, Punctuality Status, Distance from Geocenter (meters), Points Granted. | Administrative auditing grid logging geo-distance telemetry and rule outcomes. | `[V]` |

---

## 2. Critical Observations & Discrepancy Analysis

1. **Attendance Time Windows & Configurable Intervals [Resolved - DEC-003]:**
   - The visual video frames displayed intervals `07:00–08:00 (Early)`, `09:00–10:00 (Normal)`, `10:00–11:00 (Late)`, and `12:00 PM (Close)`.
   - **Resolution:** The project owner approved that all time windows and classifications are **dynamically configurable** by Admin/Manager with full audit logging. The initial default preserves 07-08 Green, 09-10 Normal, 10-11 Red, 12:00 Cutoff. Intervals 08-09 and 11-12 remain explicitly **UNSET** until configured by management (`DEC-022` OPEN). Schedules must never be hardcoded.
2. **The 0 EGP Black Penalty Paradox [Status: OPEN — DEC-011, DEC-012]:**
   - The screen explicitly writes: `Black: 1 × 1,000 EGP = 0 EGP`.
   - The financial and disciplinary binding nature of this formula remains an open decision (`DEC-011`, `DEC-012`). No automatic payroll deduction is assumed.
3. **Double-Dipping on Green Points [Status: OPEN — DEC-013]:**
   - Can an employee use 5 Green Points to clear an unexcused absence penalty, AND simultaneously retain those 5 points toward their 30-point cash reward?
   - The Green point consumption model remains an open decision (`DEC-013` OPEN; double-entry debit proposed).
4. **Third-Party Video Snippets (Permanently Excluded Noise) [Resolved - DEC-001]:**
   - In some transition frames of the prototype video, artifacts labeled "Hotel Booking System" or "New Booking" appeared. Per executive scope correction, photography session bookings are third-party noise and permanently excluded from this internal workforce management system.
5. **Check-out Integration in Core MVP [Resolved - DEC-002, DEC-005]:**
   - While the video reference highlighted the arrival Check-in action, the project owner has officially decided that **Check-out** (departure registration) is a core component of the MVP Attendance Engine, ensuring complete shift presence tracking and administrative auditability. Dual GPS validation applies to both operations (`DEC-005`).
6. **Attendance After Cutoff Rules [Resolved - DEC-004]:**
   - Visual video showed `Close 12:00 PM - Check-in unavailable`.
   - **Resolution:** Owner approved two-stage after-cutoff logic: between Cutoff and Shift End, employee can still check in, marked **Present**, assigned a **Black Card**, and notified. A Black Card is a punctuality marker for a present employee and does NOT automatically imply an unexcused absence or monetary penalty. After Shift End, self-service check-in is closed and requires admin review (`DEC-024` OPEN). Shift end is configurable.
7. **GPS Exception Handling & Pending Review Workflow [Resolved - DEC-006, DEC-007]:**
   - If GPS fails, is inaccurate, or is out-of-bounds on Check-in or Check-out, the operation is non-blocking: submitted with server time to a `Pending Review` queue. Zero points/penalties apply while pending.
   - **Check-in Approval:** Evaluates arrival classification and points at the original timestamp.
   - **Check-out Approval:** Approves departure timestamp; does NOT evaluate arrival classification or generate arrival points (`DEC-021` OPEN).
   - **Rejection:** Requires mandatory administrative reason; awards zero points; does NOT automatically generate an unexcused absence or Black Penalty (`DEC-023` OPEN). Full audit history is logged.
