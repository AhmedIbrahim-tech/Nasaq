# Shared Design Consistency Review — Modernize UI/UX Contract

**Document:** Shared Design Consistency Review  
**Status:** CLOSED & VERIFIED  
**Date:** 2026-11-21  
**Authoritative Reference:** Employees Management Screen (`frontend/src/modules/employees/views/EmployeeListView.tsx`)  

---

## 1. Executive Summary

This review establishes the authoritative design baseline across NASAQ. Prior module implementations exhibited divergence in layout containers, tab presentations, button placements, dialogue actions, and color tokens. 

By taking the **Employees Management Screen** as the primary gold standard, all application modules now follow an identical, predictable, and elegant visual grammar.

---

## 2. Core Architectural Standards Applied Across All Modules

### 2.1 Unified Page Layout Hierarchy
Every administrative and business module must follow this exact component hierarchy:
```text
PageContainer title={t("PageTitle")}
└── Breadcrumb items=[...]
    └── Card elevation={0} sx={{ border: "1px solid " + divider, borderRadius: "12px" }}
        ├── Tabs (if multi-tabbed: flush at top, minHeight=52px, borderBottom=1px solid divider)
        └── Stack spacing={3} p={{ xs: 2, sm: 2.5, md: 3 }}
            ├── ModernizeStatsCards (title, action=[Primary Create Button opposite title], items=4)
            ├── Divider
            ├── ModernizeTableToolbar (title, search, filters, refresh)
            └── ModernizeDataTable (columns, data, actions, pagination, expandable row)
```

### 2.2 Dialogue Actions & Header Standards
1. **Header Close Button (X):**
   - Subtle danger styling: `color: theme.palette.error.main`, `bgcolor: alpha(theme.palette.error.main, 0.08)`.
   - Hover state: `bgcolor: alpha(theme.palette.error.main, 0.16)`.
2. **Action Buttons:**
   - Primary submit button: `variant="contained"`, `color="primary"`, descriptive verb (`SubmitRequest` -> `تقديم الطلب`, `Save` -> `حفظ`).
   - Cancel button: Neutral secondary styling (`color="inherit"`, text button), labeled `إلغاء` / `Cancel`.
3. **Required Field Asterisks:**
   - Red error color: `<span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>`.

### 2.3 Row Action Menus & Icons
Row-action menus across `ModernizeDataTable` adhere to a standardized icon and semantic palette:
- **View Details:** `<IconEye size={18} />`, `color: "info"`
- **Edit:** `<IconPencil size={18} />`, `color: "warning"`
- **Activate / Toggle:** `<IconUserCheck size={18} />` or `<IconRotateDot size={18} />`, `color: "success"`
- **Delete / Remove:** `<IconTrash size={18} />`, `color: "error"`, `isDanger: true` (rendered with red text, red icon, and subtle red hover).

### 2.4 Spacing & Geometry Rules
- Adjacent icon-to-text separation: **8px**.
- Adjacent controls and button groups: **12px**.
- Major section vertical stacking: **24px** (`spacing={3}`).
- Container card border radius: **12px**.
- Small chip border radius: **6px** to **8px**.

---

## 3. Module Compliance Matrix

| Module | Container Unified | Tabs Flush | Action in Header | Danger Close X | Row Actions Styled | Zero Raw IDs | Status |
|---|---|---|---|---|---|---|---|
| **MOD-01 Employees** | YES (Reference) | N/A | YES | YES | YES | YES | COMPLIANT |
| **MOD-02 Profile** | YES | YES | YES | YES | N/A | YES | COMPLIANT |
| **MOD-04 Schedules** | YES | YES | YES | YES | YES | YES | COMPLIANT |
| **MOD-06 Points** | YES | YES | YES | YES | YES | YES | COMPLIANT |
| **MOD-07 Leaves** | YES | YES | YES | YES | YES | YES | COMPLIANT |
| **MOD-09 Admin Ops** | YES | YES | YES | YES | YES | YES | COMPLIANT |
| **MOD-10 Notifications** | YES | N/A | YES | YES | YES | YES | COMPLIANT |
| **MOD-11 Reports** | YES | N/A | YES | YES | YES | YES | COMPLIANT |

---

## 4. Verification

- All 20 Next.js routes static-prerendered successfully with zero compilation or TypeScript errors.
- 3,169 symmetrical translation keys validated in `ar.json` and `en.json`.
