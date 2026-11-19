---
trigger: glob
globs: "**/frontend/src/**/*.ts, **/frontend/src/**/*.tsx, **/frontend/package.json"
---

# Frontend Next.js 16 & React 19 Standards

This rule defines frontend engineering standards for the `core-starter` Next.js 16 application.

---

## 1. App Router & Component Architecture

### 1.1 Directory Structure
- Follow the App Router conventions under `frontend/src/app/`:
  - `(auth)/`: Authentication flows (login, password reset).
  - `(Dashboard)/`: Protected application workspace with sidebar and header layouts.
  - `(system)/`: Error boundaries and maintenance layouts.
  - Root files: `layout.tsx`, `page.tsx`, `not-found.tsx`, `loading.tsx`.

### 1.2 Server vs. Client Components
- **Default to Server Components:** Components in `src/app/` are Server Components by default. Keep them on the server whenever possible to minimize bundle size.
- **Client Components Directive:** Add `"use client";` at the very top of files ONLY when:
  - Using React state or lifecycle hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
  - Using Redux hooks (`useAppSelector`, `useAppDispatch`).
  - Using browser APIs (`window`, `localStorage`, `navigator`).
  - Attaching event listeners (`onClick`, `onChange`, `onSubmit`).
- Push `"use client"` directives down the component tree to leaf nodes rather than making entire pages client components.

---

## 2. Feature-Based Organization (`src/modules/`)

Group code by domain capability rather than purely technical layer. Each feature module under `frontend/src/modules/<feature>/` should follow this structure:

```text
src/modules/notifications/
├── components/          # Feature-specific UI components
├── hooks/               # Feature-specific custom React hooks
├── services/            # API call services interacting with Axios
├── slices/              # Redux slices and state reducers
│   └── thunks/          # Async thunk actions
├── types/               # TypeScript interfaces and type definitions
├── validation/          # Yup/Zod form validation schemas
└── views/               # High-level page views rendered by App Router
```

---

## 3. State Management with Redux Toolkit

- **Store Configuration:** Global Redux store is defined in `frontend/src/store/index.ts`.
- **Typed Hooks:** Always use `useAppDispatch` and `useAppSelector` from `src/store/hooks.ts` instead of untyped `useDispatch` and `useSelector`.
- **Redux Persist:** Persisted slices (like `auth`) must use the SSR-safe web storage helper with revision locking to prevent cross-tab state overwrites.
- **Async Operations:** Handle complex asynchronous actions via `createAsyncThunk` placed under `slices/thunks/`.

---

## 4. API Client & Networking (`src/lib/api/`)

- **Centralized Axios Instance:** All HTTP communication must use the centralized `api` client in `frontend/src/lib/api/api.ts`. Never use global `fetch` or create ad-hoc `axios` instances.
- **Bearer Token & Language:** The request interceptor automatically attaches:
  - `Authorization: Bearer <token>` from the Redux store.
  - `Accept-Language: <lang>` from `localStorage.getItem("corestarter_lang")`.
- **Silent Refresh Interceptor:** The response interceptor automatically handles `401 Unauthorized` responses by queuing concurrent requests into a single in-flight `refreshPromise` and refreshing tokens silently before retrying.
- **Route Constants:** Always use `Router` constants from `frontend/src/lib/api/router.ts`. Never hardcode raw endpoint URLs in components or services.

---

## 5. Forms & Validation

- Use Formik or React Hook Form combined with Yup/Zod for form state and validation.
- Define validation schemas in the feature's `validation/` directory.
- Surface error messages using localized strings from translation dictionaries (`ar.json` / `en.json`).

---

## 6. TypeScript Strictness & Standards

- **Strict Type Checking:** No `any` escapes. Define explicit interfaces in `<feature>/types/` or `shared/types/`.
- **Props Interfaces:** Every React component must define an explicit props interface:
  ```tsx
  interface NotificationItemProps {
    notification: AppNotification;
    onMarkAsRead: (id: string) => Promise<void>;
  }

  export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
    // ...
  };
  ```
- **Event Typing:** Use explicit React event types (e.g., `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`).

---

## 7. Performance & Optimization

- **Dynamic Imports:** Use `next/dynamic` for heavy components, charts, or modal dialogs not required on initial render.
- **Images:** Always use `next/image` with explicit dimensions (`width`, `height`) or `fill` to prevent Layout Shift (CLS).
- **Memoization:** Use `useMemo` and `useCallback` judiciously on expensive calculations and callbacks passed to memoized children.
