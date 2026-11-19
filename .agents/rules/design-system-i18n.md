---
trigger: glob
globs: "**/frontend/src/theme/**/*.ts, **/frontend/src/theme/**/*.tsx, **/frontend/src/i18n/**/*.ts, **/frontend/src/i18n/**/*.json, **/frontend/src/shared/components/**/*.tsx"
---

# Design System & Internationalization (i18n) Standards

This rule defines styling conventions, theme token usage, RTL layout handling, and internationalization standards for `core-starter`.

---

## 1. Material UI (MUI v6) & Modernize Design Tokens

- **Zero Hardcoded Colors:** Never write raw HEX, RGB, or HSL color literals directly in component `sx` props or inline CSS (e.g., avoid `color: "#5D87FF"`). Always reference semantic palette tokens:
  ```tsx
  // Correct
  <Typography sx={{ color: "primary.main", bgcolor: "background.paper" }}>
  // Avoid
  <Typography sx={{ color: "#5D87FF", bgcolor: "#FFFFFF" }}>
  ```
- **Theme Palettes:** Pre-configured theme palettes are defined in `frontend/src/theme/`:
  - `LightThemeColors.tsx` for light mode.
  - `DarkThemeColors.tsx` for dark mode.
  - Customizer preferences (theme mode, direction, border radius) are managed via `frontend/src/theme/customizerContext.tsx` and persisted in `localStorage`.
- **Spacing:** Always use the MUI theme spacing multiplier (e.g., `sx={{ p: 2, m: 1 }}` maps to 16px and 8px).
- **Typography:** Use semantic typography variants (`h1` through `h6`, `subtitle1`, `body1`, `body2`, `caption`). Do not manually redefine font sizes or line heights inside components unless building specialized data displays.

---

## 2. Bi-directional Layout (RTL & LTR)

- **First-Class RTL Support:** CoreStarter supports both Left-to-Right (English) and Right-to-Left (Arabic) layouts natively.
- **Direction Switching:** Controlled via `theme/Rtl.tsx` using `stylis-plugin-rtl` and stored in `localStorage` under `corestarter_dir` (`"rtl"` | `"ltr"`).
- **Direction-Aware Styling:**
  - Avoid using hardcoded directional CSS properties like `margin-left` or `right: 0` in styles where alignment should flip.
  - Use logical MUI spacing properties:
    - Use `mr` / `ml` or prefer `start` / `end` concepts.
    - For icons alongside text, ensure margins automatically adjust based on text direction.
  - Test layouts in both directions before completing UI work.

---

## 3. Bilingual Localization (Arabic & English)

- **Supported Locales:** Defined in `frontend/src/i18n/config.ts`:
  - `ar`: Arabic (`messages/ar.json`)
  - `en`: English (`messages/en.json`)
- **No Hardcoded UI Strings:** **Every single user-facing string** (labels, button texts, table headers, error messages, placeholders, tooltips) must be translated and retrieved via the translation system.
- **Key Parity:** Both `ar.json` and `en.json` must have identical key hierarchies. When adding a new key to `en.json`, you must provide the corresponding Arabic translation in `ar.json`.
- **Validation Script:** Always run the automated translation verification script after updating localization dictionaries:
  ```bash
  npm run validate:i18n
  ```
  This script verifies that no missing keys exist between languages.

---

## 4. Reusable Shared Components (`src/shared/components/`)

- Prefer reusing existing presentation components in `src/shared/components/` over creating duplicates:
  - `cards/`: `BlankCard.tsx`, `DashboardCard.tsx`
  - `container/`: `PageContainer.tsx`
  - `dialogs/`: Standard confirmation and modal dialogs
  - `feedback/`: Empty states, skeleton loaders, and alerts
  - `tables/`: Data tables with pagination and sorting
  - `forms/`: Pre-styled form controls, selects, and text inputs
- Every shared component should be accessible, responsive across breakpoints (`xs`, `sm`, `md`, `lg`, `xl`), and direction-agnostic.
