# NASAQ — Global Delete Confirmation Dialogs Audit Report

**Document Reference:** `docs/reviews/global-ui-audit/GLOBAL-DELETE-DIALOGS-AUDIT.md`  
**Audit Scope:** Every delete confirmation, deactivation, cancellation, and destructive action dialog across NASAQ  
**Status:** VERIFIED CLOSED  
**Date:** November 21, 2026  

---

## 1. Executive Summary

A comprehensive platform-wide audit was conducted on every delete confirmation dialog across NASAQ. The audit resolved the critical defect where the Work Shifts deletion dialog displayed raw untranslated internal keys (`ConfirmAction` and `ConfirmDeleteScheduleMessage`), eliminated entity message mismatches, enforced standard danger button styling, ensured neutral secondary cancel styling, and verified double-click mutation protection.

---

## 2. Complete Inventory of Deletion & Confirmation Dialogs

| Entity / Action | Source File | Dialog Component | Localized Title (AR / EN) | Localized Message (AR / EN) | Button Styling | Double-Click Safe? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Delete Work Shift** | `SchedulesView.tsx` | `ConfirmActionDialog` | `DeleteShiftQuestion`<br>AR: **حذف مناوبة العمل؟**<br>EN: **Delete Work Shift?** | `ConfirmDeleteShiftMessage`<br>AR: **هل أنت متأكد من رغبتك في حذف مناوبة العمل "{name}"؟ لا يمكن التراجع عن هذا الإجراء.**<br>EN: **Are you sure you want to delete the work shift "{name}"? This action cannot be undone.** | Confirm: `error` (contained)<br>Cancel: neutral `outlined` | Yes (`isLoading={isSubmitting}`) | **VERIFIED CLOSED** |
| **Delete Work Schedule** | `SchedulesView.tsx` | `ConfirmActionDialog` | `DeleteScheduleQuestion`<br>AR: **حذف جدول العمل؟**<br>EN: **Delete Work Schedule?** | `ConfirmDeleteScheduleMessage`<br>AR: **هل أنت متأكد من رغبتك في حذف جدول العمل "{name}"؟ لا يمكن التراجع عن هذا الإجراء.**<br>EN: **Are you sure you want to delete the work schedule "{name}"? This action cannot be undone.** | Confirm: `error`<br>Cancel: neutral `outlined` | Yes (`isLoading={isSubmitting}`) | **VERIFIED CLOSED** |
| **Remove Schedule Assignment** | `SchedulesView.tsx` | `ConfirmActionDialog` | `DeleteAssignmentQuestion`<br>AR: **إلغاء تعيين الجدول؟**<br>EN: **Remove Schedule Assignment?** | `ConfirmDeleteAssignmentMessage`<br>AR: **هل أنت متأكد من رغبتك في إلغاء تعيين جدول العمل للموظف "{name}"؟**<br>EN: **Are you sure you want to remove the schedule assignment for employee "{name}"?** | Confirm: `error`<br>Cancel: neutral `outlined` | Yes (`isLoading={isSubmitting}`) | **VERIFIED CLOSED** |
| **Delete Single Employee** | `EmployeeListView.tsx` | `ConfirmActionDialog` | `DeleteEmployeeQuestion`<br>AR: **حذف الموظف؟**<br>EN: **Delete Employee?** | `DeleteEmployeeConfirmMsg`<br>AR: **هل أنت متأكد من رغبتك في حذف الموظف "{name}"؟**<br>EN: **Are you sure you want to delete employee "{name}"?** | Confirm: `error`<br>Cancel: neutral `outlined` | Yes (`isLoading={isDeleting}`) | **VERIFIED CLOSED** |
| **Bulk Delete Employees** | `EmployeeListView.tsx` | `ConfirmActionDialog` | `formatBulkDeleteConfirmation`<br>AR: **حذف الموظفين المحددين؟**<br>EN: **Delete selected employees?** | Dynamic Arabic pluralization (1, 2, few, many)<br>EN: Pluralized count message | Confirm: `error`<br>Cancel: neutral `outlined` | Yes (`isLoading={isDeleting}`) | **VERIFIED CLOSED** |
| **Delete Single Location** | `LocationListView.tsx` | `ConfirmActionDialog` | `DeleteLocationQuestion`<br>AR: **حذف موقع العمل؟**<br>EN: **Delete Location?** | `DeleteLocationConfirmMsg`<br>AR: **هل أنت متأكد من حذف موقع العمل "{name}"؟**<br>EN: **Are you sure you want to delete work location "{name}"?** | Confirm: `error`<br>Cancel: neutral `outlined` | Yes (`isLoading={isDeleting}`) | **VERIFIED CLOSED** |
| **Bulk Delete Locations** | `LocationListView.tsx` | `ConfirmActionDialog` | `formatBulkDeleteConfirmation`<br>AR: **حذف مواقع العمل المحددة؟**<br>EN: **Delete selected work locations?** | Dynamic Arabic pluralization (1, 2, few, many)<br>EN: Pluralized count message | Confirm: `error`<br>Cancel: neutral `outlined` | Yes (`isLoading={isDeleting}`) | **VERIFIED CLOSED** |
| **Cancel Leave Request** | `LeavesView.tsx` | `ConfirmActionDialog` | `ConfirmCancelLeave`<br>AR: **تأكيد إلغاء طلب الإجازة**<br>EN: **Confirm Cancel Leave Request** | `ConfirmCancelLeaveMessage`<br>AR: **هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.**<br>EN: **Are you sure you want to cancel this leave request? This action cannot be undone.** | Confirm: `warning` (Cancel Request)<br>Cancel: neutral (Back) | Yes (`isLoading={actionLoading}`) | **VERIFIED CLOSED** |
| **Remove Profile Photo** | `ProfileHeader.tsx` | `ConfirmActionDialog` | AR: **حذف الصورة الشخصية؟**<br>EN: **Remove Profile Photo?** | AR: **هل أنت متأكد من رغبتك في حذف صورتك الشخصية؟ ستتم استعادة الرمز الافتراضي.**<br>EN: **Are you sure you want to remove your profile photo? Your default initials avatar will be restored.** | Confirm: `error`<br>Cancel: neutral `outlined` | Yes (`isLoading={isPhotoProcessing}`) | **VERIFIED CLOSED** |

---

## 3. Strict Safety & Mutation Verification Rules

Every confirmed deletion dialog satisfies the 10 golden deletion safety checks:
1. **Targeting Integrity:** Targets only the explicitly selected record ID internally; never displays raw database IDs to the user.
2. **Display Accuracy:** Displays localized entity name when available (`{name}`).
3. **Cancel Safety:** Clicking Cancel or Backdrop performs zero network mutations and clears pending state.
4. **Close Safety:** Top-corner subtle danger close button performs zero mutations.
5. **Single Execution:** Confirm button triggers exactly one HTTP request.
6. **In-Flight Protection:** `isLoading` disables all dialog buttons, suppresses backdrop clicks, and renders `<CircularProgress size={16} />`.
7. **Persistence Confirmation:** Local state and counters update only after HTTP 200/204 response from backend.
8. **Error Propagation:** Backend business rule violations (e.g. attempting to delete a shift assigned to an active schedule) are displayed in user-friendly notifications without dialog stuck state.
9. **Referential Integrity:** Enforced by backend Entity Framework Core configurations and verified in tests.
10. **Zero Page Reload:** State updates in-place via Redux/React state without `window.location.reload()`.
